#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { BastionProjectStack } from '../lib/stack'
import { config } from '../lib/config'

const app = new cdk.App()
const stack = new BastionProjectStack(app, `${config.projectName}-stack`, { 
  env: config.stack,
  description: 'Deploys cloud resources for Bastion project',
  tags: { Project: config.projectName, Deployedby: config.deployedBy } 
})

export default stack
