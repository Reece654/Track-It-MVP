/*
  JobsPage is the signed in list at /jobs.
  App.jsx draws it inside AppShell, and ProtectedRoute keeps it for a signed in user.
  The rows come from the jobs table through the shared Supabase client.
  Create job on this page opens CreateJobPage at /jobs/new.
*/

/*
  useState remembers the jobs, the loading wait, and any error while this screen is open.
  We use useEffect here so it runs the load once when our user arrives here.
  Link opens Create job without reloading the whole page.
  supabase is the same client the sign in page uses, from the services folder, so we can read and write jobs to the database.
*/

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

/*
  These are the words stored on a job, and the labels our user actually reads.
  App.css paints pending in amber, active in green, and completed in blue.
*/

const statusLabel = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
}

/*
  due_date is stored as a year month day value, the same way the jobs table keeps a date.
  formatDueDate turns that into day/month/year, so the calendar day does not shift.
*/

function formatDueDate(dueDate) {
  const [year, month, day] = dueDate.split('-')
  return `${day}/${month}/${year}`
}

function JobsPage() {
  /*
    jobs starts empty and is filled once Supabase sends this account's rows back.
    The cards are drawn from that, so they only appear after the rows are actually here.
    jobsAreLoading starts out true because the page does not know the answer yet.
    That wait stops "You have no jobs yet." from flashing before the rows arrive.
    jobsErrorMessage stays blank unless the load fails.
    A failure can then be shown on its own, instead of looking like an empty list.
  */

  const [jobs, setJobs] = useState([])
  const [jobsAreLoading, setJobsAreLoading] = useState(true)
  const [jobsErrorMessage, setJobsErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    /*
      This load runs when the page opens.
      The jobs row rules only return rows owned by the signed in user, so this query does not pick an account itself.
      Due dates come first, empty dates last, then the title, then the id.
      isMounted ignores a late reply if our user has already left the page.
    */

    supabase
      .from('jobs')
      .select('id, title, location, status, due_date, assigned_to')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('title', { ascending: true })
      .order('id', { ascending: true })
      .then(({ data, error }) => {
        if (!isMounted) {
          return
        }

        if (error) {
          setJobsErrorMessage(error.message || 'Could not load your jobs.')
          setJobsAreLoading(false)
          return
        }

        setJobs(data ?? [])
        setJobsAreLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="page">
      <h1 className="page-title">Your jobs</h1>
      <p className="page-subtitle">Jobs you have created.</p>

      {/*
        Create job goes to /jobs/new, where CreateJobPage saves a new row and then comes back here.
      */}

      <Link className="button button--primary job-create" to="/jobs/new">
        Create job
      </Link>

      {/*
        Loading shows while the request is still waiting.
      */}

      {jobsAreLoading ? (
        <p className="status-message">Loading...</p>
      ) : null}

      {/*
        The error line only appears when the load did not succeed.
        Supabase supplies its own message when it has one, and otherwise the page says "Could not load your jobs."
      */}

      {jobsErrorMessage ? (
        <p className="form-error" role="alert">
          {jobsErrorMessage}
        </p>
      ) : null}

      {/*
        This line shows when the load worked and our user has no jobs yet.
      */}

      {!jobsAreLoading && !jobsErrorMessage && jobs.length === 0 ? (
        <p className="page-copy">You have no jobs yet.</p>
      ) : null}

      {/*
        Each card shows the title, status, and location.
        The due date and assigned person only appear when those were filled in on create.
      */}

      {!jobsAreLoading && jobs.length > 0 ? (
        <ul className="job-list">
          {jobs.map((job) => (
            <li className="job-card" key={job.id}>
              <div className="job-card__top">
                <h2 className="job-card__title">{job.title}</h2>
                <span className={`job-status job-status--${job.status}`}>
                  {statusLabel[job.status] ?? job.status}
                </span>
              </div>
              <p className="job-card__meta">{job.location}</p>
              {job.due_date ? (
                <p className="job-card__meta">Due {formatDueDate(job.due_date)}</p>
              ) : null}
              {job.assigned_to ? (
                <p className="job-card__meta">Assigned to {job.assigned_to}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  )
}

export default JobsPage
