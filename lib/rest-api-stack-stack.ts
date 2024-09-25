import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import * as path from 'path'
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from "aws-cdk-lib/aws-events-targets";

export class RestApiStackStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api_processor_func = this.createApiProcessorLambda(this);
    this.restAPIGateway(this, api_processor_func);

    const layer = this.createLambdaLayer(this);
    const api_consumer_func = this.createApiConsumerLambda(this, layer);
    const eventInvokeRule = this.createEventInvocationRule(this);
    this.addEventTarget(eventInvokeRule, api_consumer_func);

  }

  // Lambda - API request processor
  createApiProcessorLambda(stack: cdk.Stack): lambda.Function {
    return new lambda.Function(stack, 'ApiProcessorLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'api-processor-lambda.handler'
    });
  }

  // API Gateway - Endpoint
  restAPIGateway(stack: cdk.Stack, lambda: lambda.Function) {
    new apigw.LambdaRestApi(stack, 'HelloWorldRestAPI', {
      handler: lambda
    });
  }

  // Lambda - API consumer
  createApiConsumerLambda(stack: cdk.Stack, layer: lambda.LayerVersion): lambda.Function {
    return new lambda.Function(stack, 'ApiConsumerLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'api-consumer-lambda.handler',
      layers: [layer]
    });
  }

  createEventInvocationRule(stack: cdk.Stack): events.Rule {
    return new events.Rule(stack, 'ApiConsumerScheduler', {
      schedule: events.Schedule.expression('cron(0/1 * * * ? *)')
    });
  }

  addEventTarget(rule: events.Rule, lambdaFun: lambda.Function) {
    rule.addTarget(new targets.LambdaFunction(lambdaFun));
  }

  createLambdaLayer(stack: cdk.Stack): lambda.LayerVersion {
    return new lambda.LayerVersion(stack, 'layer-z1', {
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
      compatibleArchitectures: [lambda.Architecture.X86_64],
      code: lambda.Code.fromAsset(path.join(__dirname, 'layers')),
      description: 'http-request-layer-z1'
    })
  }
}
