import '@testing-library/jest-dom'

// Mock Google Maps types for tests
global.google = {
  maps: {
    places: {
      Autocomplete: jest.fn(),
      AutocompleteSessionToken: jest.fn(),
      PlacesService: jest.fn(),
    },
    event: {
      clearInstanceListeners: jest.fn(),
    },
    GeocoderAddressComponent: jest.fn(),
  },
};