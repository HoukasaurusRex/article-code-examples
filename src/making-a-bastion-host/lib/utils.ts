import * as cdk from '@aws-cdk/core'
import { config } from './config'

export const camelize = (str: string): string => {
  str =  str.replace(/-./g, (x: string) => x[1].toUpperCase())
  return str[0].toUpperCase() + str.slice(1)
}

export const addTags = function(resource: cdk.IConstruct, tagsObj: Record<string, string>) {
  for(const [key, value] of Object.entries(tagsObj))
    cdk.Tags.of(resource).add(key, value)
}

export class CfnLogger {
  public readonly log: (label: string, value: string) => void
  constructor(scope: cdk.Construct, props: cdk.CfnOutputProps | {} = {}) {

    this.log = (label: string, value: string) => {
      const labelWithPrefix = camelize(`${config.projectName}${label}`)
      new cdk.CfnOutput(scope, labelWithPrefix, {
        ...props,
        value
      })
    }
  }
}