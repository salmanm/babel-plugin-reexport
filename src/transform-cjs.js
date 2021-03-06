import { template } from '@babel/core'

const moduleExpr = template.ast`
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
`

export default function transformCJS (program, state, { exportPath }, t) {
  const nodes = program.get('body')
  const exportNodes = [moduleExpr]

  nodes.forEach((n) => {
    if (!n.isExpressionStatement()) return
    if (!n.get('expression').isAssignmentExpression()) return
    if (n.get('expression.right').isAssignmentExpression()) return

    const leftExpr = n.get('expression').node.left
    if (leftExpr.object.name === 'exports') {
      exportNodes.push(
        getExportNamed(exportPath, leftExpr, t)
      )
    }

    if (leftExpr.object.name === 'module' && leftExpr.property.name === 'exports') {
      exportNodes.push(
        getExportDefault(exportPath, leftExpr, t)
      )
    }
  })

  nodes.forEach(n => n.remove())
  exportNodes
    .filter(Boolean)
    .forEach(n => program.pushContainer('body', n))
}

/** Generates line like `exports.fn = require('pkg-dir/file').fn` */
function getExportNamed (exportPath, leftExpr, t) {
  const exportIdentifier = leftExpr.property.value || leftExpr.property.name

  return t.expressionStatement(
    t.assignmentExpression(
      '=',
      leftExpr,
      t.memberExpression(
        t.callExpression(
          t.identifier('require'), [t.stringLiteral(exportPath)]
        ), t.identifier(exportIdentifier)
      )
    )
  )
}

/** Generates line like `module.exports = require('pkg-dir/file')` */
function getExportDefault (exportPath, leftExpr, t) {
  return t.expressionStatement(
    t.assignmentExpression(
      '=',
      leftExpr,
      t.callExpression(
        t.identifier('require'), [t.stringLiteral(exportPath)]
      )
    )
  )
}
