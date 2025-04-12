import axios from "axios";
import { Github, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react"
import { toast, ToastContainer, Bounce } from "react-toastify";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function App() {

  const [ theme, setTheme ] = useState<'light' | 'dark'>('light');
  const [ username, setUsername ] = useState<string>(localStorage.getItem('username') || '');
  const [ userInfo, setUserInfo ] = useState<any>(null);
  const [ repos, setRepos ] = useState<any[]>([]);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ error, setError ] = useState<string | null>(null);
  const [ history, setHistory ] = useState<any[]>(() => {
    const storedHistory = localStorage.getItem('history');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUserInfo(null);
    setRepos([]);
    setError(null);
    localStorage.setItem('username', e.target.value);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await axios.get(`https://api.github.com/users/${username}`);
      const { avatar_url, name, location, bio, followers, html_url, following } = data.data
      const userdata = {
        avatar: avatar_url,
        name,
        username,
        location,
        bio,
        followers_counts: followers,
        following_counts: following,
        link: html_url
      }
      setUserInfo(userdata);
      localStorage.setItem('userInfo', JSON.stringify(userdata));
      
      const reposData = await axios.get(`https://api.github.com/users/${username}/repos`);
      setRepos(reposData.data.sort((a: any, b: any) => b.size - a.size));
      localStorage.setItem('repos', JSON.stringify(reposData.data.sort((a: any, b: any) => b.size - a.size)));
      toast.success(`Successfully searched for ${username} `, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      if (!history.some((user) => user.username === username)) {
        setHistory((prevHistory) => {
          const newHistory = [...prevHistory, userdata];
          localStorage.setItem('history', JSON.stringify(newHistory));
          return newHistory;
        });
      }
    } catch (err) {
      console.log(err);
      setError('User not found, please enter a valid username');
      toast.error('Github username not found', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
    setLoading(false);
  }

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) =>  {
    const sortedRepos = [...repos].sort((a, b) => {
      if (e.target.value === 'stars') {
        return b.stargazers_count - a.stargazers_count;
      } else if (e.target.value === 'name') {
        return a.name.localeCompare(b.name);
      } else if (e.target.value === 'forks') {
        return b.forks_count - a.forks_count;
      } else if (e.target.value === 'updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (e.target.value === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return 0;
      }
    });
    setRepos(sortedRepos);
    localStorage.setItem('repos', JSON.stringify(sortedRepos));
    toast.success(`Sorted by ${e.target.value}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  }

  const info = localStorage.getItem('userInfo');

  useEffect(() => {
    if (info !== null) {
      setLoading(true);
      setError(null);
      try {
        setUserInfo( localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo') || '') : null);
        setRepos(localStorage.getItem('repos') ? JSON.parse(localStorage.getItem('repos') || '') : []);
      } catch (err) {
        console.log(err);
        setError('User not found');
      }
    }
    setLoading(false);
  }, [info]);


  return (
    <>
      <div className={`w-full  ${theme === 'dark' ? 'bg-[#101828] text-white' : 'bg-white'}`}>
        {/* Navbar containing the logo and the toggle button  */}
        <nav className={`w-full z-10 fixed top-0 h-14 flex justify-between items-center sm:px-20 border-b px-6  ${theme === 'dark' ? ' border-[#ffffff10] bg-[#101828] shadow-2xl': 'shadow-lg bg-white border-[#00000040]' } `}>
            <div className="flex items-center gap-1">
              <div className="p-1 rounded-lg border">
                <Github size={16} />
              </div>
              <div className="flex items-center gap-2">
                <h1>GIT</h1>
                <span className="text-[9px] border px-1 rounded-2xl mt-1" >Search</span>
              </div>
            </div>
            <button className={`flex relative border shadow-2xl h-6 w-12 rounded-2xl cursor-pointer ${theme === 'light' ? 'bg-[#00000005] border-[#00000020]' : 'border-[#ffffff60]'} `}  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                <div className={`absolute h-full w-6 rounded-full border flex items-center justify-center  ${theme === 'light' ? 'left-0 border-[#00000070] bg-white' : 'right-0 border-white bg-[#ffffff30]'} `}>
                    {
                      theme === 'light' ? (
                        <Sun size={12} />
                      ) : (
                        <Moon size={12} color="white" />
                      )
                    }
                </div>
            </button>
        </nav>
        <main className={`w-full min-h-screen pt-20 items-center flex flex-col justify-center px-2 sm:px-20 ${theme === 'dark' ? 'bg-[#10182810] text-white' : 'bg-white'}`}>
            <div className="w-full sm:px-20 relative flex flex-col gap-2">
              <label htmlFor="" className="font-medium">Github Username</label>
              <form className="relative items-center flex" onSubmit={handleSubmit}>
                <input type="text" className={`shadow-sm outline-0 border ${theme === 'dark' ? 'border-[#ffffff60]': 'border-[#00000045]'} w-full py-4 px-6 rounded-3xl`} placeholder="Enter your github username" onChange={handleChange} value={username} />
                <button type="submit" className={`absolute right-0 border-l font-light duration-300 hover:font-semibold cursor-pointer h-full px-6 ${theme === 'dark' ? 'border-[#ffffff60]': 'border-[#00000045]'} `}>{loading ? 'Searching...': 'Search'}</button>
              </form>
              {
                error && (
                  <p className="text-red-500 text-sm text-center font-semibold mt-2">{error}</p>
                )
              }
            </div>
            {
              userInfo ? (
                <div className="flex flex-col w-full ">
                  <div className="flex w-full justify-between mt-12 pr-6">
                    <div></div>
                    <select name="sort" id="" className={`border h-8 text-[12px] px-2 rounded-3xl cursor-pointer ${theme === 'dark' ? 'border-[#d1abab40] bg-[#101828] text-white' : 'border-[#00000025] bg-white'}`} onChange={handleSort}>
                      <option value="sort" >Sort by</option>
                      <option value="name">Name</option>
                      <option value="stars">Stars</option>
                      <option value="forks">Forks</option>
                      <option value="created">Most Recent</option>
                      <option value="updated">Updated</option>
                    </select>
                  </div>
                  <div className={`w-full max-sm:px-4 max-sm:items-center sm:px-20 flex sm:flex-row flex-col sm:justify-between gap-10 mt-10 ${theme === 'dark' ? 'bg-[#101828] text-white' : 'bg-white'}`}>
                    <div className="flex flex-col gap-4 sm:w-[40%] w-full shadow-2xl h-fit rounded-3xl sm:pl-8 sm:pr-28 pl-4 pb-10 pt-4 items-start">
                      {
                        !loading ? (
                          <>
                            <h1 className="uppercase text-[11px] font-semibold">Candidate Info</h1>
                            <div className="flex flex-col gap-4 items-start">
                              <img src={userInfo.avatar} alt="" className="w-24 h-24 rounded-full" />
                              <div className="flex flex-col gap-0.5">
                                <h1 className="text-xl font-semibold capitalize">{username}</h1>
                                {userInfo.name !== null && <h1 className="text-lg font-semibold">Name: {userInfo.name}</h1>}
                                {userInfo.bio && <p className="text-sm text-gray-500">Bio: {userInfo.bio}</p>}
                                {userInfo.location && <p className="text-sm text-gray-500">Location: {userInfo.location}</p>}
                                <a href={userInfo.link} target="_blank" className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">View Profile</a>
                                <p className="text-sm text-gray-500">Followers: {userInfo.followers_counts} Following: {userInfo.following_counts}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <Skeleton />
                        )
                      }
                    </div>
                    <div className="flex flex-col sm:w-[60%] w-full p-4 ">
                      {
                        !loading ? (
                          <>
                            <h1 className="text-lg font-semibold mb-2">Repository List </h1>
                            {
                              repos.slice(0,5).map((repo, index) => (
                                <div key={index} className={`border-b p-4  ${theme === 'dark' ? 'bg-[#101828] text-white' : 'bg-white'}`}>
                                  <h1 className="text-lg font-semibold">{repo.name}</h1>
                                  {repo.description !== null && <p className="text-sm text-gray-500"><span className="font-semibold">Description:</span> {repo.description}</p>}
                                  <div className="flex gap-2 text-[12px]">
                                    <p className=" text-gray-500"><span className="font-semibold">Stars:</span> {repo.stargazers_count}</p>
                                    <p className=" text-gray-500"><span className="font-semibold">Forks:</span> {repo.forks_count}</p>
                                  </div>
                                  {repo.language && <p className="text-[12px] text-gray-500"><span className="font-semibold">Primary Language:</span> {repo.language}</p>}
                                </div>
                              ))
                            }
                          </>
                        ): (
                          <Skeleton count={5} />
                        )
                      }
                    </div>
                  </div>
                </div>
              ) : (
                history.length > 0 ? (
                  <div className="flex flex-col gap-2 w-full max-sm:px-4 max-sm:items-center sm:px-20 mt-10">
                    <div className="flex w-full justify-between">
                      <h1 className="text-lg font-semibold mb-2">History</h1>
                      <button className="text-red-500 text-xs cursor-pointer" onClick={() =>{
                        setHistory([]);
                        localStorage.removeItem('history');
                        toast.success('History cleared successfully', {
                          position: "top-right",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: false,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "light",
                          transition: Bounce,
                        });
                      }}>Clear history</button>
                    </div>
                    {
                      history.slice(0,5).reverse().map((user, index) => (
                        <div key={index} className={`border-b p-4 w-full opacity-55  ${theme === 'dark' ? 'bg-[#101828] text-white' : 'bg-white'}`}>
                          <h1 className="text-lg font-semibold capitalize">{user.username}</h1>
                          {user.name !== null && <h1 className="text-sm font-semibold">Name: {user.name}</h1>}
                          {user.location && <p className="text-sm text-gray-500">Location: {user.location}</p>}
                          <a href={user.link} target="_blank" className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">View Profile</a>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full max-sm:px-4 max-sm:items-center sm:px-20 mt-10">
                    <h1 className="text-lg font-semibold mb-2">History</h1>
                    <p className="text-sm text-gray-500">No history found</p>
                    <p className="text-xl opacity-40 text-gray-500 text-center">Search for a user to see their history</p>
                  </div>  
                )
              )
            }
        </main>
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
      </div>
    </>
  )
}

export default App
