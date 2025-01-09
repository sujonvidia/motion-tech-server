import { Injectable, Inject } from '@nestjs/common';
import { ID, Product, RequestContext, TransactionalConnection, EventBus } from '@vendure/core';
import { FACEBOOK_PIXEL_PLUGIN_OPTIONS } from '../constants';
import { PluginInitOptions } from '../types';
import { OrderPlacedEvent  } from '@vendure/core';

@Injectable()
export class PixelService {
    constructor(
        private connection: TransactionalConnection,
        private eventBus: EventBus,
        @Inject(FACEBOOK_PIXEL_PLUGIN_OPTIONS) private options: PluginInitOptions) 
        {
            this.eventBus.ofType(OrderPlacedEvent).subscribe((event) => this.handleOrderPlacedEvent(event));
        }

        // Event handler for OrderPlacedEvent
    private async handleOrderPlacedEvent(event: OrderPlacedEvent) {
        const { order } = event;
        console.log('handleOrderPlacedEvent:pixel:',order);

        // Example: Send order data to Facebook Pixel for conversion tracking
        // this.sendPixelEvent('Purchase', {
        //     content_name: 'Order # ' + order.code,
        //     content_ids: order.items.map(item => item.productId),
        //     content_type: 'product',
        //     value: order.totalPrice,
        //     currency: 'USD',
        // });
    }
    // Method to send events to Facebook Pixel
    // private sendPixelEvent(eventName: string, eventData: Record<string, any>) {
    //     const pixelCode = this.options.pixelCode;

    //     if (pixelCode) {
    //         const fbPixelEventData = {
    //             event_name: eventName,
    //             event_time: Math.floor(Date.now() / 1000),
    //             user_data: {
    //                 em: 'user@example.com', 
    //             },
    //             custom_data: eventData,
    //             pixel_id: pixelCode,
    //         };

    //         fetch('https://graph.facebook.com/v12.0/<PIXEL_ID>/events', {
    //             method: 'POST',
    //             body: JSON.stringify({ data: [fbPixelEventData] }),
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${this.options.apiSecret}`,
    //             },
    //         })
    //             .then((response) => response.json())
    //             .then((data) => console.log('Facebook Pixel Event Sent', data))
    //             .catch((error) => console.error('Error sending Pixel event', error));
    //     }
    // }

    async exampleMethod(ctx: RequestContext, id: ID) {
        // Add your method logic here
        const result = await this.connection.getRepository(ctx, Product).findOne({ where: { id } });
        return result;
    }
}
