import Path from 'path';

export default function({ types: t }) {
  return {
    visitor: {
      Program: {
        exit(path, state) {
          fn(path, state, t)
        }
      }
    },
  };
}

const defaultOpts = {
  moduleDir: '/node_modules/'
}

function fn (path, state, t) {
  const program = path.scope.getProgramParent().path;

  const nodes = program.get('body');
  const hasNamedExport = nodes.some(n => n.isExportNamedDeclaration());
  const hasDefaultExport = nodes.some(n => n.isExportDefaultDeclaration());
  const hasNamedDefaultExport = hasNamedExport && nodes.some(n => {
    if (!n.isExportNamedDeclaration() || !n.has('specifiers')) return false;

    const specifiers = n.get('specifiers');
    const { exported } = specifiers[0].node;
    return specifiers.length === 1 && exported.name === 'default';
  });

  const { moduleDir } = { ...defaultOpts, ...state.opts };
  const filePath = state.filename;
  const pkgDir = Path.dirname(filePath.substr(filePath.indexOf(moduleDir) + moduleDir.length));
  const fileName = Path.basename(filePath, Path.extname(filePath));
  const exportPath = Path.join(pkgDir, fileName);

  const exportNode = hasDefaultExport || hasNamedDefaultExport ? getDefaultExport(exportPath, t) : getNamedExport(exportPath, t);

  nodes.forEach(n => n.remove());
  program.pushContainer('body', exportNode);
}

/** Generates line like `export default from 'pkg-dir/file'` */
function getDefaultExport(exportPath, t) {
  const defaultIdentifier = t.identifier('default');
  const specifiers = [t.exportSpecifier(defaultIdentifier, defaultIdentifier)];

  return t.exportNamedDeclaration(null, specifiers, t.stringLiteral(exportPath));
}

/** Generates line like `export * from 'pkg-dir/file'` */
function getNamedExport(exportPath, t) {
  return t.exportAllDeclaration(t.stringLiteral(exportPath));
}
