const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const JOBS_DIR = path.join(__dirname, 'jobs');

function listPendingJobs() {
  const files = fs.readdirSync(JOBS_DIR).filter(f => f.endsWith('.json'));
  const jobs = files.map(f => {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(JOBS_DIR, f)));
      return j;
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
  return jobs.filter(j => j.status === 'pending');
}

async function processJob(job) {
  const jobFile = path.join(JOBS_DIR, `${job.id}.json`);
  try {
    job.status = 'running';
    fs.writeFileSync(jobFile, JSON.stringify(job, null, 2));

    const videoItems = job.media.filter(m => m.type === 'video' || (m.url && m.url.match(/\.(mp4|mov|mkv|webm)(\?|$)/i)));
    if (videoItems.length === 0) {
      job.status = 'failed';
      job.error = 'no_video_items';
      fs.writeFileSync(jobFile, JSON.stringify(job, null, 2));
      return;
    }

    const downloaded = [];
    for (const item of videoItems) {
      const url = item.url;
      const filename = path.join(UPLOAD_DIR, `${Date.now()}-${path.basename(url).split('?')[0]}`);
      const writer = fs.createWriteStream(filename);
      const response = await axios.get(url, { responseType: 'stream' });
      await new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      downloaded.push(filename);
    }

    const listFile = path.join(UPLOAD_DIR, `list-${job.id}.txt`);
    const listContent = downloaded.map(f => `file '${f}'`).join('\n');
    fs.writeFileSync(listFile, listContent);

    const outFilename = path.join(UPLOAD_DIR, `${Date.now()}-${job.output}`);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c', 'copy'])
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outFilename);
    });

    job.status = 'done';
    job.result = `${outFilename}`;
    fs.writeFileSync(jobFile, JSON.stringify(job, null, 2));
  } catch (err) {
    console.error('Job error', err);
    job.status = 'failed';
    job.error = err.message;
    fs.writeFileSync(jobFile, JSON.stringify(job, null, 2));
  }
}

async function loop() {
  while (true) {
    try {
      const pending = listPendingJobs();
      for (const job of pending) {
        console.log('Processing job', job.id);
        await processJob(job);
      }
    } catch (e) {
      console.error('Worker error', e);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

loop();
