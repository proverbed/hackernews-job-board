import { useState, useEffect, useCallback, useRef } from 'react';
import JobCard from './components/JobCard';

const PAGE_SIZE = 6;

type JobDetails = {
  id: number;
  time: number;
  title: string;
  text: string;
  by: string;
  url: string;
  score: number;
};

function App() {
  const [jobIds, setJobIds] = useState<[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [numberLoadedJobs, setNumberLoadedJobs] = useState<number>(0);
  const didMount = useRef(false);

  function getJobDetails(ids: number[]): Promise<JobDetails[]> {
    try {
      if (ids.length === 0) {
        return Promise.resolve([]);
      }

      const jobPromises = ids.map((id: number) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then((response) => response.json())
          .catch((error) => {
            console.error('Error fetching job data:', error);
            return null; // Return null for failed fetches
          })
      );
      return Promise.all(jobPromises).then(
        (results) => results.filter((job): job is JobDetails => job !== null) // Filter out null values
      );
    } catch (error) {
      console.error('Error fetching job data:', error);
      return Promise.resolve([]); // Ensure a return value in the catch block
    }
  }

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      if (jobIds.length === 0) {
        return;
      }

      // Fetch job details for the first PAGE_SIZE jobs
      const newJobDetails = await getJobDetails(
        jobIds.slice(numberLoadedJobs, numberLoadedJobs + PAGE_SIZE)
      );
      setJobDetails((prevJobDetails) => {
        const data = [...prevJobDetails, ...newJobDetails].filter(
          (job, index, self) =>
            job.id !== null && index === self.findIndex((j) => j.id === job.id)
        );
        // Filter out duplicates
        setNumberLoadedJobs(data.length);
        return data;
      });
      didMount.current = true;
      setLoading(false);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  }, [jobIds, numberLoadedJobs]);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        // Fetch job IDs
        const response = await fetch(
          'https://hacker-news.firebaseio.com/v0/jobstories.json'
        );
        const jobIds = await response.json();
        setJobIds(jobIds);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchJobData();
  }, []);

  useEffect(() => {
    if (!didMount.current) {
      loadJobs();
    }
  }, [jobIds, loadJobs]);

  return (
    <>
      <header>
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
            Hacker News Job Board
          </h1>
        </div>
      </header>

      <div className="grid m-4">
        <ul className="">
          {jobDetails.map((job: JobDetails) => (
            <JobCard key={job.id} {...job} />
          ))}
        </ul>
        <button
          className="border-gray-400 border-[1px] w-42 rounded-md p-1 cursor-pointer disabled:cursor-not-allowed enabled:hover:bg-amber-400"
          onClick={loadJobs}
          disabled={jobDetails.length === jobIds.length}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      </div>
    </>
  );
}

export default App;
