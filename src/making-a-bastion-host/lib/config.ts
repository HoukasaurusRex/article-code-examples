import * as dotenv from 'dotenv'

dotenv.config()

if(!process.env.AWS_ACCOUNT_NUMBER) throw new Error('AWS_ACCOUNT_NUMBER undefined')

const stage = process.env.NODE_ENV || 'development'

export const config = {
    stage,
    projectName: `bastion-host-project-${stage}`,
    stack: {        
        account: process.env.AWS_ACCOUNT_NUMBER,
        region: process.env.AWS_REGION
    },
    deployedBy: process.env.DEPLOYED_BY || 'robots',
    aws: {
        ec2: {
            sshKeyPair: {
                pgBastion: 'bastion-host-project-keypair'
            }
        },
        rds: {
            username: process.env.DB_USERNAME || process.env.DEPLOYED_BY || 'itguy',
            databaseName: process.env.DB_NAME || stage
        }
    }
}
