const fs = require('fs');
const playback = fs.readFileSync('supabase/functions/api/playbackService.ts', 'utf8');
const match = playback.match(/const needsDurationEstimation = (.*?);/);
console.log(match[1]);
