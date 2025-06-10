#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Image optimization script for Urbex project
 * Optimizes JPG/JPEG images to WebP format with compression
 */

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const OUTPUT_QUALITY = 80;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

class ImageOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      errors: 0,
      totalOriginalSize: 0,
      totalOptimizedSize: 0,
    };
  }

  async optimizeImage(inputPath, outputPath) {
    try {
      const inputStats = await fs.stat(inputPath);
      this.stats.totalOriginalSize += inputStats.size;

      console.log(`Optimizing: ${inputPath}`);

      await sharp(inputPath)
        .resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: OUTPUT_QUALITY,
          effort: 6, // Higher effort for better compression
        })
        .toFile(outputPath);

      const outputStats = await fs.stat(outputPath);
      this.stats.totalOptimizedSize += outputStats.size;
      this.stats.processed++;

      const reduction = ((inputStats.size - outputStats.size) / inputStats.size) * 100;
      console.log(`✓ Optimized: ${this.formatFileSize(inputStats.size)} → ${this.formatFileSize(outputStats.size)} (${reduction.toFixed(1)}% reduction)`);

    } catch (error) {
      console.error(`✗ Error optimizing ${inputPath}:`, error.message);
      this.stats.errors++;
    }
  }

  async processDirectory(inputDir, outputDir) {
    try {
      await fs.mkdir(outputDir, { recursive: true });
      const files = await fs.readdir(inputDir);

      for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const fileStat = await fs.stat(inputPath);

        if (fileStat.isDirectory()) {
          const subOutputDir = path.join(outputDir, file);
          await this.processDirectory(inputPath, subOutputDir);
        } else {
          const ext = path.extname(file).toLowerCase();
          if (SUPPORTED_EXTENSIONS.includes(ext)) {
            const nameWithoutExt = path.parse(file).name;
            const outputPath = path.join(outputDir, `${nameWithoutExt}.webp`);
            await this.optimizeImage(inputPath, outputPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${inputDir}:`, error.message);
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printStats() {
    console.log('\n📊 Optimization Summary:');
    console.log(`Files processed: ${this.stats.processed}`);
    console.log(`Errors: ${this.stats.errors}`);
    console.log(`Original total size: ${this.formatFileSize(this.stats.totalOriginalSize)}`);
    console.log(`Optimized total size: ${this.formatFileSize(this.stats.totalOptimizedSize)}`);
    
    if (this.stats.totalOriginalSize > 0) {
      const totalReduction = ((this.stats.totalOriginalSize - this.stats.totalOptimizedSize) / this.stats.totalOriginalSize) * 100;
      console.log(`Total size reduction: ${totalReduction.toFixed(1)}%`);
    }
  }
}

async function main() {
  console.log('🚀 Starting image optimization...\n');

  const optimizer = new ImageOptimizer();
  const projectRoot = path.resolve(__dirname, '..');
  const publicDir = path.join(projectRoot, 'public');
  
  // Optimize specific directories
  const targetDirs = [
    { input: 'images/hero', output: 'images/hero/optimized' },
    { input: 'images/about', output: 'images/about/optimized' },
    { input: 'images/services', output: 'images/services/optimized' },
    { input: 'images/clients', output: 'images/clients/optimized' },
  ];

  for (const { input, output } of targetDirs) {
    const inputPath = path.join(publicDir, input);
    const outputPath = path.join(publicDir, output);
    
    try {
      await fs.access(inputPath);
      console.log(`\n📂 Processing: ${input}`);
      await optimizer.processDirectory(inputPath, outputPath);
    } catch (error) {
      console.log(`⚠️  Directory not found: ${input}`);
    }
  }

  optimizer.printStats();
  console.log('\n✅ Image optimization complete!');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ImageOptimizer }; 