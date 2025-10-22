/**
 * MediaContainer Debug Utilities
 * 
 * Console helpers for diagnosing MediaContainer sizing issues.
 * Use in browser console when debugging.
 */

export function debugMediaContainer(selector?: string) {
  const containers = selector 
    ? document.querySelectorAll(selector)
    : document.querySelectorAll('.ds-media-container');
  
  if (containers.length === 0) {
    console.warn('No MediaContainers found');
    return;
  }
  
  console.group(`🔍 MediaContainer Debug (${containers.length} found)`);
  
  containers.forEach((mc, i) => {
    const figure = mc as HTMLElement;
    const content = mc.querySelector('.ds-media-container__content') as HTMLElement;
    const picture = mc.querySelector('picture') as HTMLElement;
    const video = mc.querySelector('video') as HTMLVideoElement;
    const img = mc.querySelector('img') as HTMLImageElement;
    
    const figureRect = figure.getBoundingClientRect();
    const figureStyle = getComputedStyle(figure);
    
    console.group(`\n${i + 1}. MediaContainer ${figureRect.width < 10 ? '❌ COLLAPSED' : '✅'}`);
    
    // Figure analysis
    console.log('FIGURE:');
    console.log('  Size:', `${figureRect.width.toFixed(1)}×${figureRect.height.toFixed(1)}px`);
    console.log('  CSS width:', figureStyle.width);
    console.log('  aspect-ratio:', figureStyle.aspectRatio);
    console.log('  display:', figureStyle.display);
    console.log('  margin:', figureStyle.margin);
    
    // Content div analysis
    if (content) {
      const contentRect = content.getBoundingClientRect();
      const contentStyle = getComputedStyle(content);
      console.log('\nCONTENT DIV:');
      console.log('  Size:', `${contentRect.width.toFixed(1)}×${contentRect.height.toFixed(1)}px`);
      console.log('  position:', contentStyle.position);
      console.log('  inset:', contentStyle.inset);
    }
    
    // Picture analysis
    if (picture) {
      const pictureRect = picture.getBoundingClientRect();
      const pictureStyle = getComputedStyle(picture);
      console.log('\nPICTURE:');
      console.log('  Size:', `${pictureRect.width.toFixed(1)}×${pictureRect.height.toFixed(1)}px`);
      console.log('  display:', pictureStyle.display);
      console.log('  width:', pictureStyle.width);
    }
    
    // Video analysis
    if (video) {
      const videoRect = video.getBoundingClientRect();
      const videoStyle = getComputedStyle(video);
      console.log('\nVIDEO:');
      console.log('  Size:', `${videoRect.width.toFixed(1)}×${videoRect.height.toFixed(1)}px`);
      console.log('  display:', videoStyle.display);
      console.log('  dimensions:', `${video.videoWidth}×${video.videoHeight}`);
    }
    
    // Image analysis
    if (img) {
      const imgStyle = getComputedStyle(img);
      console.log('\nIMG:');
      console.log('  Natural:', `${img.naturalWidth}×${img.naturalHeight}px`);
      console.log('  Rendered:', imgStyle.width, 'x', imgStyle.height);
      console.log('  object-fit:', imgStyle.objectFit);
      console.log('  Loaded:', img.complete ? '✅' : '⏳');
    }
    
    // Check for wrapper divs (should not exist)
    const wrapperDiv = content?.querySelector('div:not([class*="media"])');
    if (wrapperDiv) {
      console.warn('\n⚠️ WRAPPER DIV DETECTED! This breaks sizing.');
      console.warn('   Remove wrapper and pass Picture/Video directly');
    }
    
    // Check if in grid
    const inGrid = figure.closest('.ds-grid');
    if (inGrid) {
      console.log('\n📦 GRID CONTEXT:');
      const gridStyle = getComputedStyle(inGrid);
      console.log('  columns:', gridStyle.gridTemplateColumns.split(' ').length);
      console.log('  gap:', gridStyle.gap);
      
      if (parseFloat(figureStyle.marginLeft) > 0 || parseFloat(figureStyle.marginRight) > 0) {
        console.warn('  ⚠️ Has horizontal margins in grid! This causes overflow.');
      }
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
}

// Global helper
if (typeof window !== 'undefined') {
  (window as any).debugMediaContainer = debugMediaContainer;
  console.log('💡 MediaContainer debugger loaded. Use: debugMediaContainer()');
}
