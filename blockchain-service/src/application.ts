import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import * as lpcore from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import { BlockchainClient } from './services/blockchain-service';
import {IdentityService} from './services/identity-service';
import { CocoaRepository } from './repositories';
export {ApplicationConfig};

export class BlockchainServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    this.service(BlockchainClient).inScope(lpcore.BindingScope.SINGLETON);
    this.service(IdentityService).inScope(lpcore.BindingScope.SINGLETON);
    this.repository(CocoaRepository).inScope(lpcore.BindingScope.REQUEST);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,

      },
    };
  }
}
