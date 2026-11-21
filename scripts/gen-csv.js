import fs from 'node:fs';
const out = fs.createWriteStream('products.csv');
(async () => {
  out.write('name,price,stock\n');
  for (let i = 1; i <= 500000; i++) {
    const line = `Product ${i},${(Math.random() * 500 + 1).toFixed(2)},${Math.floor(Math.random() * 100)}\n`;
    if (!out.write(line)) await new Promise((r) => out.once('drain', r));   // Backpressure حتى هنا
  }
  out.end();
})();