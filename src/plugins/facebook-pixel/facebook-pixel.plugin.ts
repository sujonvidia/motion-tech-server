import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { FACEBOOK_PIXEL_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { PixelService } from './services/pixel.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: FACEBOOK_PIXEL_PLUGIN_OPTIONS, useFactory: () => FacebookPixelPlugin.options }, PixelService],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.0',
})
export class FacebookPixelPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<FacebookPixelPlugin> {
        this.options = options;
        return FacebookPixelPlugin;
    }
}
