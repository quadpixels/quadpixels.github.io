import processing.opengl.PGraphics2D;
import com.thomasdiewald.pixelflow.java.imageprocessing.filter.DwFilter;
import processing.sound.*;
import com.thomasdiewald.pixelflow.java.DwPixelFlow;

FFT fft;
AudioIn in;
int NUM_BANDS = 2048;
float FFT_MULTIPLIER = 100;
float[] spectrum = new float[NUM_BANDS];

DwPixelFlow context;
DwFilter filter;
PGraphics2D pg_render, pg_luminance, pg_bloom, pg_blank, pg_history;
PFont font12;

PFont font24;
Lyricist g_lyricist;

int WIN_W = 640;
int WIN_H = 360;

boolean g_debug = true;

public void setup() {
  size(720, 480, P3D);
  
  context = new DwPixelFlow(this);
  context.print();
  context.printGL();
  filter = new DwFilter(context);
  pg_render = (PGraphics2D) createGraphics(width, height, P2D);
  pg_luminance = (PGraphics2D) createGraphics(width, height, P2D);
  pg_bloom = (PGraphics2D) createGraphics(width, height, P2D);
  pg_blank = (PGraphics2D) createGraphics(width, height, P2D);
  pg_history = (PGraphics2D) createGraphics(width, height, P2D);
  
  font12 = createFont("C:/Windows/Fonts/arial.ttf", 12);
  font24 = createFont("C:\\Temp\\fzltxh.TTF",36);
  
  // FFT
  fft = new FFT(this, NUM_BANDS);
  in = new AudioIn(this, 1);
  in.start();
  fft.input(in);

  // Lyricist
  g_lyricist = new Lyricist(pg_render);

  background(220);
  frameRate(30);
}

public void draw() {
  final int NUM_BANDS_SHOWN = 320;
  fft.analyze(spectrum);
  
  pg_render.beginDraw();
  {
    pg_render.blendMode(BLEND);
    pg_render.background(0);
    for (int i=0; i<NUM_BANDS_SHOWN; i++) {
      float completion = i * 1.0f / (NUM_BANDS_SHOWN - 1);
      float completion1 = (i+1) * 1.0f / (NUM_BANDS_SHOWN - 1);
      int x0 = (int)(width * 1.0f * completion);
      int x1 = (int)(width * 1.0f * completion1);
      int delta_y = (int)Math.sqrt(spectrum[i] * height * FFT_MULTIPLIER);
      int y = (int)(height * 2 / 3);
      //pg_render.pushMatrix();
      pg_render.strokeWeight(2.0f);
      float b = 240 * (1.0f - completion);
      float g = 240 * completion;
      pg_render.stroke(color(32, g, b));
      pg_render.fill(128);
      pg_render.rect(x0, y-delta_y, x1-x0, 2*delta_y); 
      //pg_render.popMatrix();
    }
  }
  
  {
    g_lyricist.Render(pg_render);
  }
  
  pg_render.endDraw();
  
  // BLOOM
  filter.luminance_threshold.param.threshold = 0.4f; // when 0, all colors are used
  filter.luminance_threshold.param.exponent  = 5;
  filter.luminance_threshold.apply(pg_render, pg_luminance);
  
  filter.bloom.param.mult   = 2.23f; // 1.8f; //map(mouseX, 0, width, 0, 10);
  filter.bloom.param.radius = 0.77f; // 0.9f; //map(mouseY, 0, height, 0, 1);
  filter.bloom.apply(pg_luminance, pg_bloom, pg_render);
  
  image(pg_render, 0, 0);
  
  // UI
  String txt = String.format("mult=%g, radius=%g", filter.bloom.param.mult, filter.bloom.param.radius);
  surface.setTitle(txt);
  //textAlign(CENTER);
  //textFont(font12);
  //stroke(255);
  //float dx = width * 0.5f, dy = height * 0.5f; 
  //text(txt, dx, dy);
  
  if (g_debug) {
    g_lyricist.ShowDebugInfo();
  }
}

boolean shift_flag = false;
void keyPressed() {
  if (key == 'r') {
    g_lyricist.MoveLine(0, false);
  } else if (key == 'j' || key == 'J') {
    g_lyricist.MoveLine(1, shift_flag);
  } else if (key == 'k') {
    g_lyricist.MoveLine(-1, false);
  } else if (key == 'd') {
    g_debug = !g_debug;
  } else if (key == 'b') { // 只开
    g_lyricist.RegisterEventListOnTime();
  } else if (key == 'm') { // 只关
    g_lyricist.RegisterEventListOffTime();
  } else if (key == 'n') { // 关了再开
    g_lyricist.RegisterEventListOffTime();
    g_lyricist.RegisterEventListOnTime();
  } else if (key == 'v') { // 重设当前行的时间线
    g_lyricist.ResetCurrentEventList();
  } else if (key == 'p') {
    g_lyricist.DumpAllEventLists();
  } else if (keyCode == SHIFT) {
    shift_flag = true;
  } else if (key == 'g') {
    g_lyricist.GotoNextLineAndStartAutoScrollLine(); // 行到下一行并且打开自动换行
  } else if (key == ' ') {
    g_lyricist.CancelAutoScrollLine(); // 停止自动换行
  } else if (key == '[') {
    FFT_MULTIPLIER *= 0.7f;
  } else if (key == ']') {
    FFT_MULTIPLIER *= 1.0f/0.7f;
  }
}

void keyReleased() {
  if (keyCode == SHIFT) {
    shift_flag = false;
  }
}
