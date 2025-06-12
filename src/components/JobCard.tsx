type JobCardProperties = {
  title: string;
  by: string;
  time: number;
  url: string;
};

export default function JobCard({ url, title, by, time }: JobCardProperties) {
  const date = new Date(time*1000).toLocaleString();

  return (
    <div className="p-4 my-4 border-[1px] border-gray-300 rounded-md">
      <a href={url} target="_blank" rel='noopener'><h2 className="text-2xl font-bold">{title}</h2></a>
      <div className='text-gray-500'>By {by} <span> &#x2022; {date}</span></div>
    </div>
  );
}