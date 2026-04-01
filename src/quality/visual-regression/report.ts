import type { VisualRegressionResult } from '../../core/types.js';

export function generateVisualReport(result: VisualRegressionResult): string {
  const status = result.overallPassed ? 'PASSED' : 'FAILED';
  const statusColor = result.overallPassed ? '#22c55e' : '#ef4444';

  const viewportRows = result.viewports.map((vp) => `
    <tr>
      <td>${vp.name}</td>
      <td>${vp.width}px</td>
      <td style="color: ${vp.passed ? '#22c55e' : '#ef4444'}">${(vp.diffPercent * 100).toFixed(2)}%</td>
      <td>${vp.diffPixels.toLocaleString()}</td>
      <td style="color: ${vp.passed ? '#22c55e' : '#ef4444'}">${vp.passed ? 'PASS' : 'FAIL'}</td>
    </tr>
    <tr>
      <td colspan="5">
        <div style="display: flex; gap: 8px; padding: 8px 0;">
          <div style="flex: 1; text-align: center;">
            <p style="font-size: 12px; color: #666;">Original</p>
            <img src="${vp.originalScreenshot}" style="max-width: 100%; border: 1px solid #ddd;" />
          </div>
          <div style="flex: 1; text-align: center;">
            <p style="font-size: 12px; color: #666;">Clone</p>
            <img src="${vp.cloneScreenshot}" style="max-width: 100%; border: 1px solid #ddd;" />
          </div>
          <div style="flex: 1; text-align: center;">
            <p style="font-size: 12px; color: #666;">Diff</p>
            <img src="${vp.diffScreenshot}" style="max-width: 100%; border: 1px solid #ddd;" />
          </div>
        </div>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Morph Visual Regression Report</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    .status { font-size: 18px; font-weight: bold; color: ${statusColor}; }
  </style>
</head>
<body>
  <h1>Morph Visual Regression Report</h1>
  <p class="status">Overall: ${status}</p>
  <p>Generated: ${new Date().toISOString()}</p>
  <table>
    <thead>
      <tr>
        <th>Viewport</th>
        <th>Width</th>
        <th>Diff %</th>
        <th>Diff Pixels</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${viewportRows}
    </tbody>
  </table>
</body>
</html>`;
}
