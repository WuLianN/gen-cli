#! /usr/bin/env node

import { Command } from 'commander'
import packageJSON from '../package.json' assert { type: "json" }
import inquirer from 'inquirer'
import templateList from './template.mjs'
import downloadGitRepo from 'download-git-repo'
import path from 'path'
import ora from 'ora'
import fsExtra from 'fs-extra'

const { version } = packageJSON

const program = new Command();

// 当前版本
program.version(`v${version}`)

// 指令
program
  .command('create [projectName]') // [projectName]是可选 <projectName>是必填
  .option('-t, --template <template>', '模板名称') // 配置项 --template xxx
  .description('创建项目')
  .action(async (projectName, options) => {
    // 1. 从模版列表中找到对应的模版
    const project = templateList.find(template => template.name === options.template)

    // 2. 如果匹配到模版就赋值，没有匹配到就是undefined
    let projectTemplate = project ? project.value : undefined
    console.log('命令行参数：', projectName, projectTemplate) 

    // 3. // 如果用户没有传入名称就交互式输入
    if (!projectName) {
      const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: '请输入项目名称: '
      })
      projectName = name
    }
    console.log("项目名称: ", projectName)
  
    // 4. 如果用户没有传入模版就交互式输入
    if (!projectTemplate) {
      // 模板列表
      const { template } = await inquirer.prompt({
        type: 'list',
        name: 'template',
        message: '请选择模板',
        choices: templateList
      })
      projectTemplate = template 
    }
    console.log('模板: ', projectTemplate)
    
    const dir = path.join(process.cwd(), projectName) // 目录

    // 判断文件夹是否存在，存在就交互询问用户是否覆盖
    if (fsExtra.existsSync(dir)) {
      const { force } = await inquirer.prompt({
        type: 'confirm',
        name: 'force',
        message: '目录已存在, 是否覆盖?'
      })

      // 如果覆盖就删除文件夹继续往下执行，否的话就退出进程
      force ? fsExtra.removeSync(dir) : process.exit(1)
    }

    ora('正在下载模板...').start() // 开启loading特效

    // 下载模板
    downloadGitRepo(projectTemplate, dir, err => {
      ora().stop() // 结束loading特效
      if (err) {
        ora.fail('创建模板失败' + err.message)
      } else {
        ora.succeed('创建模板成功!')
      }
    })
  })

// program.on('--help', () => {})  

// 解析用户执行命令传入参数
program.parse(process.argv)