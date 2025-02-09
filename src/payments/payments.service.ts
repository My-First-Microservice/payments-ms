import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecretKey);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items } = paymentSessionDto;
    const line_items = items.map(({ name, quantity, price }) => ({
      price_data: {
        currency,
        product_data: {
          name,
        },
        unit_amount: Math.round(price * 100),
      },
      quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      // Colocar aquí el id de la orden
      payment_intent_data: {
        metadata: {},
      },
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:3003/payments/success',
      cancel_url: 'http://localhost:3003/payments/cancel',
    });
    return session;
  }

  stripeWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;
    const endpointSecret = '';

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'] as Buffer,
        signature,
        endpointSecret,
      );
    } catch (error) {
      return res.status(400).send(`Webhook error: ${error}`);
    }

    switch (event.type) {
      case 'charge.succeeded':
      //TODO: call the microservice
    }

    return res.json({
      signature,
    });
  }
}
