import * as path from 'path';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { LANDING_PAGE_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: LANDING_PAGE_PLUGIN_OPTIONS, useFactory: () => LandingPagePlugin.options }],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.0',
})
export class LandingPagePlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<LandingPagePlugin> {
        this.options = options;
        return LandingPagePlugin;
    }

    static ui: AdminUiExtension = {
        id: 'landing-page-ui',
        extensionPath: path.join(__dirname, 'ui'),
        routes: [{ route: 'landing-page', filePath: 'routes.ts' }],
        providers: ['providers.ts'],
    };
}
