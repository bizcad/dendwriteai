# DendWrite AI Setup Questions

Complete list of setup questions organized by topic for QuestionManager.

## Anthropic

1. What is your Anthropic account email address?
   - Type: email

2. What is your password for Anthropic?
   - Type: password

3. Do you have a phone number for 2FA?
   - Type: phone

4. What is your Anthropic API Key?
   - Type: text
   - 🔒 Encrypted

5. What is your plan tier?
   - Type: select

## Vercel

1. What is your Vercel account email address?
   - Type: email

2. What is your password for Vercel?
   - Type: password

3. Do you have a GitHub account to connect?
   - Type: boolean

4. What is your Vercel API Token?
   - Type: text
   - 🔒 Encrypted

5. What is your desired Vercel project name?
   - Type: text

6. Do you want GitHub OAuth for user login?
   - Type: boolean

## Convex

1. What is your Convex account email address?
   - Type: email

2. What is your password for Convex?
   - Type: password

3. What is your desired Convex project name?
   - Type: text

4. What is your Convex Deployment Key?
   - Type: text
   - 🔒 Encrypted

5. What is your Convex Production URL?
   - Type: url

## GitHub

1. Do you have a GitHub account?
   - Type: boolean

2. What is your GitHub username?
   - Type: text

3. What is your GitHub email address?
   - Type: email

4. What is your GitHub Personal Access Token?
   - Type: text
   - 🔒 Encrypted

5. Do you have 2FA enabled on GitHub?
   - Type: boolean

6. What is your repository name?
   - Type: text

## Domain

1. Do you want to use a custom domain?
   - Type: boolean

2. What is your custom domain name?
   - Type: text
   - Conditional: custom_domain==true

3. Which domain registrar do you use?
   - Type: select
   - Conditional: custom_domain==true

4. Do you have nameserver access?
   - Type: boolean
   - Conditional: custom_domain==true

## Deployment

1. What is your target environment?
   - Type: select

2. Do you want production monitoring enabled?
   - Type: boolean

3. Do you want application logs enabled?
   - Type: boolean

4. What is your NEXTAUTH_SECRET?
   - Type: password
   - 🔒 Encrypted

