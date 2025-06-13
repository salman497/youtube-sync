import { convertYouTubeVideoToMp3 } from './utils/convert-youtube-video-to-mp3';

async function testYouTubeToMp3() {
  try {
    console.log('🚀 Testing YouTube to MP3 conversion...\n');
    
    // Test parameters
    const videoId = 'Zjp3zIZwloE';
    const playlistName = 'Islamic-Lectures';
    const fileName = 'Life Changing Bayan ┇ Phir Nek Nahi ho Tum - Dr. Israr Ahmed';
    
    console.log('📋 Test Parameters:');
    console.log(`   Video ID: ${videoId}`);
    console.log(`   YouTube URL: https://www.youtube.com/watch?v=${videoId}`);
    console.log(`   Playlist: ${playlistName}`);
    console.log(`   Filename: ${fileName}`);
    console.log('');
    
    // Convert the video
    const outputPath = await convertYouTubeVideoToMp3(videoId, playlistName, fileName);
    
    console.log('\n🎉 Test completed successfully!');
    console.log(`📁 File saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('\n💥 Test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testYouTubeToMp3(); 