import pathUtils from 'path'
import transformESM from './transform-esm'
import transformCJS from './transform-cjs'

const defaultOpts = {
  moduleDir: '/node_modules/'
}

export default function ({ types: t }) {
  return {
    visitor: {
      Program: {
        exit (path, state) {
          const opts = { ...defaultOpts, ...state.opts }
          const program = path.scope.getProgramParent().path
          const transformFn = program.node.sourceType === 'script' ? transformCJS : transformESM

          const { moduleDir } = opts
          const filePath = state.filename
          const pkgDir = pathUtils.dirname(filePath.substr(filePath.indexOf(moduleDir) + moduleDir.length))
          const fileName = pathUtils.basename(filePath, pathUtils.extname(filePath))
          const exportPath = pathUtils.join(pkgDir, fileName)

          transformFn(program, state, { exportPath }, t)
        }
      }
    }
  }
}
