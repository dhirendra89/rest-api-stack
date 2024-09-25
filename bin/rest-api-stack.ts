import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RestApiStackStack } from '../lib/rest-api-stack-stack';

const app = new cdk.App();
new RestApiStackStack(app, 'RestApiStackStack', {
  env: { account: 'XXXXXXX', region: 'XXXXXXXX' }
});