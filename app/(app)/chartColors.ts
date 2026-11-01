// Chart colours. These passed the palette validator on white (colourblind separation, contrast); orange is below 3:1,
// so it only appears with a visible label and count. Kept out of Charts.tsx because server pages can't read values
// exported from a client file.
export const CHART = { blue: "#4D74C3", teal: "#0E9384", orange: "#E38B2C" };
