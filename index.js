#!/usr/bin/env node
import chalk from 'chalk'
import * as dotenv from 'dotenv'
import figlet from 'figlet'
import gradient from 'gradient-string'
import inquirer from 'inquirer'
import { createSpinner } from 'nanospinner'
import { stdin as input, stdout as output } from 'node:process'
import * as readline from 'node:readline/promises'
import { Configuration, OpenAIApi } from 'openai'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: __dirname + '/.env' })

const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms))

const modes = {
  default: {
    system_prompt:
      "You are Epitek an informative assistant. You only present facts you are sure about. If you don't know the answer, you say so. You try present condense facts to help out your user.",
    temperature: 0.7,
    presence_penalty: 0,
  },
  rewrite: {
    system_prompt:
      'You are Epitek a master rewriter. You are given a text and you need to rewrite it to make it as good as possible. You can and should remove parts of the text and you can and should add new parts.',
    temperature: 0.9,
    presence_penalty: 0.5,
  },
  french: {
    system_prompt:
      'You are Epitek a master French-English translator. You are to help the user with any French work. Whether that be translation, creating a French text, or anything else.',
  },
}

async function main() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = new OpenAIApi(configuration)

  console.log(
    gradient.pastel.multiline(
      figlet.textSync('Epitek', {
        font: 'speed',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true,
      })
    ),
    '\n'
  )

  if (process.env.OPENAI_API_KEY === undefined) {
    console.log(
      chalk.red(
        'You need to set the OPENAI_API_KEY environment variable to use this app.\n(Create a ".env" file in the root directory and add OPENAI_API_KEY="your_api_key")'
      )
    )
    process.exit(1)
  }

  const { mode } = await inquirer.prompt({
    type: 'list',
    name: 'mode',
    message: 'Select mode',
    choices: Object.keys(modes),
  })

  console.log(chalk.green('\nHello I am Epitek! I am here to help you!'), '\n')

  const rl = readline.createInterface({ input, output })

  // console.log(modes[mode].system_prompt)
  let messages = [
    {
      role: 'system',
      content: modes[mode].system_prompt,
    },
  ]
  while (true) {
    const answer = await rl.question(chalk.green(chalk.bold('? ')))
    messages.push({ role: 'user', content: answer })

    const spinner = createSpinner('Thinking...').start()
    const { data } = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: modes[mode].temperature || modes['default'].temperature,
      presence_penalty:
        modes[mode].presence_penalty || modes['default'].presence_penalty,
    })
    messages.push(data.choices[0].message)

    spinner.success({
      text: chalk.grey(data.choices[0].message.content),
      mark: chalk.red(chalk.bold('!')),
    })
  }
}

await main()
