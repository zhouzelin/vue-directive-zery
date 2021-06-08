const fs = require('fs')
const render = require('json-templater/string')
const endOfLine = require('os').EOL
// 导出路径
var OUTPUT_PATH = 'src/index.js';
// 导入template、安装组件template、主要template
var IMPORT_TEMPLATE = 'import {{name}} from \'./directives/{{package}}.js\';';
var INSTALL_COMPONENT_TEMPLATE = '  {{key}}';
var MAIN_TEMPLATE = `/* Automatically generated by './build/dist.js' */
// databus
import Databus from 'utils/databus.js'
// directives
{{include}}

let databus = new Databus()

const directives = {
{{install}}
}

const Zery = {
  use(useList) {
    if (useList) {
      this.useList = useList
    }
  },
  install(Vue) {
    if (!this.useList) {
      this.useList = Object.keys(directives)
    }
    this.useList.forEach(item => {
      if (directives[item]) {
        Vue.directive(item, directives[item])
      } else {
        throw new Error('不存在该指令')
      }
    })
    Vue.prototype.$zery = this
  },
  setOption(options) {
    if (options instanceof Object && !Array.isArray(options)) {
      databus = overwrite(databus, options)
    } else {
      throw new Error('type of options is invalid')
    }
  }
}

const overwrite = (A, B) => {
  if (B instanceof Object && !Array.isArray(B)) {
    for(let k in B) {
      if (A.hasOwnProperty(k)) {
        A[k] = overwrite(A[k], B[k])
      }
    }
  } else {
    A = B
  }
  return A
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default Zery
`
const directives = fs.readdirSync('src/directives')

const includeComponentTemplate = []
const installTemplate = []

directives.forEach(dir => {
  const name = dir.split('.')[0]
  includeComponentTemplate.push(render(IMPORT_TEMPLATE, {
    name: name,
    package: name
  }))
  installTemplate.push(render(INSTALL_COMPONENT_TEMPLATE, {
    key: name
  }))
})

var template = render(MAIN_TEMPLATE, {
  include: includeComponentTemplate.join(endOfLine),
  install: installTemplate.join(',' + endOfLine)
});

fs.writeFileSync(OUTPUT_PATH, template);
console.log('[build entry] DONE:', OUTPUT_PATH);

