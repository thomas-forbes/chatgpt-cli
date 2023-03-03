import chalk from 'chalk'
import figlet from 'figlet'
import gradient from 'gradient-string'
import inquirer from 'inquirer'
import { createSpinner } from 'nanospinner'
import { Configuration, OpenAIApi } from 'openai'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

import * as dotenv from 'dotenv'
dotenv.config()

const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = new OpenAIApi(configuration)
  const rl = readline.createInterface({ input, output })

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
  console.log(chalk.green('Hello I am Epitek! I am here to help you!'), '\n')

  // const { mode } = await inquirer.prompt({
  //   type: 'list',
  //   name: 'mode',
  //   message: 'Select mode',
  //   choices: ['dev', 'prod'],
  // })
  let messages = [
    {
      role: 'system',
      content:
        "You are Epitek an informative assistant. You only present facts you are sure about. If you don't know the answer, you say so. You try present condense facts to help out your user.",
      // "You are a Epitek a helpful assistant. You don't say anything you aren't certain is true. You try to fulfill your user's requests to the fullest extent.",
    },
  ]
  while (true) {
    const answer = await rl.question(chalk.green(chalk.bold('? ')))
    messages.push({ role: 'user', content: answer })

    const spinner = createSpinner('Thinking...').start()
    const { data } = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
    })
    messages.push(data.choices[0].message)

    spinner.success({
      text: chalk.grey(data.choices[0].message.content),
      mark: chalk.red(chalk.bold('!')),
    })
  }
}

await main()
