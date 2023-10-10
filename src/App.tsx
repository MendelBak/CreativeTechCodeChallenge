import { useEffect, useState } from 'react';
import './App.css';
import Select from 'react-select';
import { json2csv } from 'json-2-csv';
import { FaPeopleGroup } from 'react-icons/fa6';
import { FaFlagUsa } from 'react-icons/fa';
import { BsFillCalendarDateFill } from 'react-icons/bs';

interface IUSAData {
  data: IStateData[];
  //  NOTE: The API also returns source data but I didn't include it here as it's not part of the scope.
  // "source": SourceData;
}

interface IStateData {
  State: string;
  'ID State': string;
  'ID Year': number;
  Year: string;
  Population: number;
  'Slug State': string;
  Abbreviation: string;
}

interface IStateDataWithSelect extends IStateData {
  label: string;
  value: string;
}

const stateAbbreviations = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  'District of Columbia': 'DC',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Puerto Rico': 'PR',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
};

function App() {
  const [USAData, setUSAData] = useState<IUSAData>();
  const [selectedOption, setSelectedOption] = useState<IStateDataWithSelect | null>();

  const fetchStateData = () => {
    fetch(
      'https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest'
    )
      .then((response) => {
        return response.json();
      })
      .then((data: IUSAData) => {
        if (!data) return;
        insertAbbreviationToStateData(data);
        setUSAData(data);
      });
  };

  useEffect(() => {
    fetchStateData();
  }, []);

  function insertAbbreviationToStateData(usData: IUSAData) {
    usData.data.forEach((stateData: IStateData) => {
      // Using the state name, add the abbreviation to each state object
      const stateName = stateData.State;
      if (stateAbbreviations[stateName as keyof typeof stateAbbreviations]) {
        stateData.Abbreviation =
          stateAbbreviations[stateName as keyof typeof stateAbbreviations];
      }
    });
  }

  function arrangeDataForSelect() {
    const updatedObject: IStateDataWithSelect[] = [];

    USAData?.data.forEach((state: IStateData) => {
      updatedObject.push({
        State: state.State,
        'ID State': state['ID State'],
        label: `${state.State} - ${state.Abbreviation}`,
        value: state.State,
        'ID Year': state['ID Year'],
        Year: state.Year,
        Population: state.Population,
        'Slug State': state['Slug State'],
        Abbreviation: state?.Abbreviation,
      });
    });

    return updatedObject;
  }

  arrangeDataForSelect();

  const selectStyles = {
    option: (styles) => {
      return {
        ...styles,
        color: '#111',
      };
    },
  };

  function formatPopulationWithCommas(population: number) {
    return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  async function downloadCSV() {
    const filename = 'export.csv';
    const csv = await json2csv(USAData?.data as object[]);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <div id='main-content'>
      <div id='upper-content'>
        <div>Creative Technology Solutions - US State API Data</div>
        <Select
          options={arrangeDataForSelect()}
          styles={selectStyles}
          closeMenuOnSelect
          onChange={(selection) => setSelectedOption(selection)}
          escapeClearsValue
        />
      </div>
      <div id='state-info'>
        {selectedOption ? (
          <>
            <div>
              <FaFlagUsa />{' '}
              <span>Name: {selectedOption?.State}</span>
            </div>
            <div>
              <FaPeopleGroup />{' '}
              <span>
                Population:{' '}
                {formatPopulationWithCommas(selectedOption?.Population)}
              </span>
            </div>
            <div>
              <BsFillCalendarDateFill />{' '}
              <span>Info Year: {selectedOption?.Year}</span>
            </div>
          </>
        ) : null}
        <button onClick={() => downloadCSV()}>Export to CSV</button>
      </div>
    </div>
  );
}

export default App;
