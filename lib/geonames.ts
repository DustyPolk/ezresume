// GeoNames API integration for city search
// Note: You need to register for a free account at https://www.geonames.org/login

interface GeoNameCity {
  geonameId: number;
  name: string;
  adminName1: string; // State/Province
  countryCode: string;
  countryName: string;
  population: number;
  lat: string;
  lng: string;
}

interface GeoNamesResponse {
  geonames: GeoNameCity[];
  totalResultsCount: number;
}

export interface LocationOption {
  value: string;
  label: string;
  data?: {
    cityName: string;
    state: string;
    country: string;
    population: number;
    lat: number;
    lng: number;
  };
}

const GEONAMES_API_BASE = 'https://secure.geonames.org';

export async function searchCities(
  query: string, 
  offset: number = 0,
  limit: number = 10,
  username?: string
): Promise<{
  options: LocationOption[];
  hasMore: boolean;
  totalCount: number;
}> {
  if (!query || query.length < 2) {
    return { options: [], hasMore: false, totalCount: 0 };
  }

  // Use the username from environment variable or parameter
  const geoNamesUsername = username || process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
  
  if (!geoNamesUsername) {
    console.error('GeoNames username not provided. Please set NEXT_PUBLIC_GEONAMES_USERNAME in your .env.local file');
    // Return fallback data
    return getFallbackCities(query, offset, limit);
  }

  try {
    const params = new URLSearchParams({
      q: query,
      maxRows: limit.toString(),
      startRow: offset.toString(),
      cities: 'cities1000', // Cities with population > 1000
      orderby: 'relevance',
      featureClass: 'P', // Populated places
      username: geoNamesUsername,
      type: 'json',
      style: 'FULL',
    });

    const response = await fetch(`${GEONAMES_API_BASE}/searchJSON?${params}`);
    
    if (!response.ok) {
      throw new Error(`GeoNames API error: ${response.status}`);
    }

    const data: GeoNamesResponse = await response.json();

    const options: LocationOption[] = data.geonames.map(city => {
      // Format the location string
      let label = city.name;
      
      // Add state for US and Canada
      if (['US', 'CA'].includes(city.countryCode) && city.adminName1) {
        label += `, ${city.adminName1}`;
      }
      
      // Add country if not US
      if (city.countryCode !== 'US') {
        label += `, ${city.countryName}`;
      } else if (city.adminName1) {
        // For US cities, use state abbreviation
        const stateAbbr = getStateAbbreviation(city.adminName1);
        if (stateAbbr) {
          label = `${city.name}, ${stateAbbr}`;
        }
      }

      return {
        value: label,
        label: label + (city.population > 100000 ? ' ⭐' : ''), // Star for larger cities
        data: {
          cityName: city.name,
          state: city.adminName1,
          country: city.countryName,
          population: city.population,
          lat: parseFloat(city.lat),
          lng: parseFloat(city.lng),
        },
      };
    });

    // Add remote options if searching for "remote"
    if (query.toLowerCase().includes('remote') && offset === 0) {
      options.unshift(
        { value: 'Remote', label: 'Remote 🌍' },
        { value: 'Remote, USA', label: 'Remote, USA 🇺🇸' },
        { value: 'Remote (Global)', label: 'Remote (Global) 🌐' }
      );
    }

    return {
      options,
      hasMore: data.totalResultsCount > offset + limit,
      totalCount: data.totalResultsCount,
    };
  } catch (error) {
    console.error('Error searching cities:', error);
    // Return fallback data on error
    return getFallbackCities(query, offset, limit);
  }
}

// Fallback function when GeoNames is not available
function getFallbackCities(query: string, offset: number, limit: number): {
  options: LocationOption[];
  hasMore: boolean;
  totalCount: number;
} {
  const fallbackCities = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
    'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
    'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
    'San Francisco, CA', 'Seattle, WA', 'Denver, CO', 'Boston, MA',
    'Remote', 'Remote, USA', 'Remote (Global)',
  ];

  const filtered = fallbackCities.filter(city => 
    city.toLowerCase().includes(query.toLowerCase())
  );

  const paginatedOptions = filtered.slice(offset, offset + limit).map(city => ({
    value: city,
    label: city,
  }));

  return {
    options: paginatedOptions,
    hasMore: filtered.length > offset + limit,
    totalCount: filtered.length,
  };
}

// US State abbreviations
const stateAbbreviations: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
};

function getStateAbbreviation(stateName: string): string | null {
  return stateAbbreviations[stateName] || null;
}