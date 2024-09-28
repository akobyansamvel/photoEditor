export const rgbToXyz = (rgb) => {
  let [r, g, b] = rgb.map(v => v / 255);
  r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
  g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
  b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;

  return [
    (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
    (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100,
    (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100
  ];
};

export const rgbToLab = (rgb) => {
  const [x, y, z] = rgbToXyz(rgb).map(v => v / 100);
  const [xr, yr, zr] = [0.95047, 1.00000, 1.08883];
  const fx = x / xr > 0.008856 ? Math.cbrt(x / xr) : (903.3 * (x / xr) + 16) / 116;
  const fy = y / yr > 0.008856 ? Math.cbrt(y / yr) : (903.3 * (y / yr) + 16) / 116;
  const fz = z / zr > 0.008856 ? Math.cbrt(z / zr) : (903.3 * (z / zr) + 16) / 116;

  return [
    (116 * fy) - 16,
    500 * (fx - fy),
    200 * (fy - fz)
  ];
};

export const rgbToLch = (rgb) => {
  const [l, a, b] = rgbToLab(rgb);
  const c = Math.sqrt(a ** 2 + b ** 2);
  const h = Math.atan2(b, a) * 180 / Math.PI;
  return [l, c, h];
};

// Конвертация RGB в линейное RGB
const linearRgb = (rgb) => {
  return rgb.map(v => {
    let scaled = v / 255;
    return scaled <= 0.04045 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
  });
};

// Преобразование линейного RGB в OKLab
const rgbToOklab = (rgb) => {
  const [r, g, b] = linearRgb(rgb);
  const lms = [
    0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b,
    0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b,
    0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b,
  ];

  const l = Math.cbrt(lms[0]);
  const m = Math.cbrt(lms[1]);
  const s = Math.cbrt(lms[2]);

  const okL = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

  return [okL, okA, okB];
};

// Преобразование OKLab в OKLch
export const rgbToOKLch = (rgb) => {
  const [okL, okA, okB] = rgbToOklab(rgb);
  const c = Math.sqrt(okA ** 2 + okB ** 2);  // Хроматичность (C)
  const h = Math.atan2(okB, okA) * (180 / Math.PI);  // Оттенок (H)
  
  return [okL, c, h];  // Возвращаем L (светлота), C (хроматичность), H (оттенок)
};


export const calculateContrast = (color1, color2) => {
  const luminance = (rgb) => {
    const a = rgb.map(v => v / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  const l1 = luminance(color1.rgb);
  const l2 = luminance(color2.rgb);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};





