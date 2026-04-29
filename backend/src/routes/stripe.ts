import { Router, Request, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require('stripe');
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';

export const stripeRouter = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStripe(): any {
  return new StripeLib(process.env.STRIPE_SECRET_KEY!);
}

/* POST /api/stripe/checkout — create a Stripe Checkout session */
stripeRouter.post('/checkout', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    res.status(503).json({ error: 'Payments not configured yet' });
    return;
  }
  try {
    const stripe = getStripe();
    const pool = getPool();
    const userResult = await pool.query(
      'SELECT email, stripe_customer_id FROM users WHERE id = $1',
      [req.userId]
    );
    const user = userResult.rows[0];

    let customerId: string = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, req.userId]);
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'https://app.octolio.me';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${frontendUrl}/dashboard?pro=1`,
      cancel_url: `${frontendUrl}/onboarding`,
      metadata: { userId: String(req.userId) },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Payment session failed' });
  }
});

/* POST /api/stripe/portal — open billing portal to manage subscription */
stripeRouter.post('/portal', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({ error: 'Payments not configured yet' });
    return;
  }
  try {
    const stripe = getStripe();
    const pool = getPool();
    const userResult = await pool.query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [req.userId]
    );
    const customerId = userResult.rows[0]?.stripe_customer_id;
    if (!customerId) {
      res.status(400).json({ error: 'No billing account found' });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'https://app.octolio.me';
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${frontendUrl}/profile`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: 'Portal session failed' });
  }
});

/* The webhook handler — exported separately so index.ts can mount it with raw body */
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(200).json({ received: true }); // silently ignore if not configured
    return;
  }
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'] as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature error:', err);
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  const pool = getPool();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId) {
        await pool.query(
          'UPDATE users SET is_pro = TRUE, onboarding_done = TRUE, stripe_subscription_id = $1 WHERE id = $2',
          [session.subscription, userId]
        );
        console.log(`User ${userId} upgraded to Pro`);
      }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.paused') {
      const sub = event.data.object;
      await pool.query(
        'UPDATE users SET is_pro = FALSE WHERE stripe_subscription_id = $1',
        [sub.id]
      );
      console.log(`Subscription ${sub.id} cancelled — user downgraded`);
    }

    if (event.type === 'customer.subscription.resumed') {
      const sub = event.data.object;
      await pool.query(
        'UPDATE users SET is_pro = TRUE WHERE stripe_subscription_id = $1',
        [sub.id]
      );
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  res.json({ received: true });
}
