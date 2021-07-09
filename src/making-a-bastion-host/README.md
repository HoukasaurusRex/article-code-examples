# Making a Bastion Host CDK Example

Read [Making a Bastion Host](https://jt.houk.space/articles/making-a-bastion-host/) for the original in-depth explanation of the project.

## Getting Started

### Configure .env

```yml
AWS_ACCOUNT_NUMBER='xxxXXXxxxXXXxxx'
AWS_REGION='us-east-1'
DEPLOYED_BY='buzz_lightyear'

DB_NAME='serious_business_db' # defaults to development
DB_USERNAME='emperor_zerg' # defaults to deployed_by
```

### Install node_modules

```sh
npm install
```

### Create EC2 KeyPair

Create keypair `bastion-host-project-keypair` in AWS EC2 console and download locally.

Update permissions of keypair file

```sh
chmod 400 ~/.ssh/bastion-host-project-keypair.pem
```

### Deploy Stack

```sh
cdk deploy
```

### Connect to Database

Start the ssh tunnel

```sh
ssh -i ~/.ssh/bastion-host-project-keypair.pem -NL 8886:[DatabaseEndpoint]:5432 ec2-user@[BastionHostPublicDNS] -v
```

Get the database credentials ARN stored in AWS Secrets Manager either from the AWS console
or by running the CLI command below (getting the ARN from the cloudformation console output).

```sh
aws secretsmanager get-secret-value --secret-id arn:[BastionHostProjectDevelopmentDatabaseCredentialsARN]
```

Connect to the database via psql

```sh
psql -h 127.0.0.1 -p 8886 -d development -U [username]
```

## Constructs

* VPC with public and private subnets
* RDS Postgres instance in private subnet
* EC2 Bastion instance in public subnet

## Useful commands

* `npm run synth` - verify integrity of cloudformation templates
* `npm run diff` - output AWS infrastructure changelog
* `npm run deploy` - deploy stack
* `npm run destroy` - destroy stack
