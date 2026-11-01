import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../services/supabase'

// Holds the readable label for each stored job status
const statusLabel = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
}

// Turns a stored dates into the format DD/MM/YYYY
function formatDueDate(dueDate) {
  const [year, month, day] = dueDate.split('-')
  return `${day}/${month}/${year}`
}

// Shows one job as read only with the status as a badge and no dropdown
function JobDetailsPage() {
    // Gets the job id from the address
    const { jobId } = useParams()
    // Stores the job once it loads
    const [job, setJob] = useState(null)
    // Stores if the job is still loading
    const [jobIsLoading, setJobIsLoading] = useState(true)
    // Stores the error message if load fails
    const [jobErrorMessage, setJobErrorMessage] = useState('')

    // Loads the job when the page opens or the job id changes
    useEffect(() => {
      // Tracks if the page is still open
      let isMounted = true

      // Gets this job by its id with RLS only returns to the user who owns it
      supabase
        .from('jobs')
        .select(
          'id, title, description, location, status, due_date, estimated_hours, assigned_to, notes',
        )
        .eq('id', jobId)
        .maybeSingle()
        .then(({ data, error }) => {
          // Ignores the reply after the user has left the page
          if (!isMounted) {
            return
          }

          // Handles a failed load and gives error message
          if (error) {
            // Gets the error message from supabase or uses the preset message
            setJobErrorMessage(error.message || 'Could not load this job.')
            setJobIsLoading(false)
            return
          }

          // Handles a job that doesnt exist or thats not thier 
          if (!data) {
            setJobErrorMessage('This job could not be found.')
            setJobIsLoading(false)
            return
          }

          // Saves the job and stops the loading message
          setJob(data)
          setJobIsLoading(false)
        })

      // If the user leave the page it will ignore the reply since its marked as closed
      return () => {
        isMounted = false
      }
  }, [jobId])

// Creates the job details page
 return (
    <main className="page">

      {/* Back takes the user to JobsPage at without changing anything */}
      <Link className="page-back" to="/jobs">
        ‹ Back
      </Link>
      <h1 className="page-title">Job details</h1>
      <p className="page-subtitle">View this job. Status can be changed on Edit.</p>

      {/* Loading is shown when the request is still waiting */}
      {jobIsLoading ? (
        <p className="status-message">Loading...</p>
      ) : null}

      {/* Error only shows when the load didnt work
      Supabase gives its own message if avliable or uses stored error message"*/}
      {jobErrorMessage ? (
        <p className="form-error" role="alert">
          {jobErrorMessage}
        </p>
      ) : null}

      {/* All fields are read only on this screen
      Status uses the same badge colours as the jobs list
      The optional values only show when they were saved */}
      {!jobIsLoading && job ? (
        <>
          <div className="job-detail">
            <div className="job-detail__top">
              <h2 className="job-detail__title">{job.title}</h2>
              <span className={`job-status job-status--${job.status}`}>
                {statusLabel[job.status] ?? job.status}
              </span>
            </div>

            <div className="job-detail__block">
              <h3 className="job-detail__label">Description</h3>
              <p className="job-detail__value">{job.description}</p>
            </div>

            <div className="job-detail__block">
              <h3 className="job-detail__label">Location</h3>
              <p className="job-detail__value">{job.location}</p>
            </div>

            {job.due_date ? (
              <div className="job-detail__block">
                <h3 className="job-detail__label">Due date</h3>
                <p className="job-detail__value">{formatDueDate(job.due_date)}</p>
              </div>
            ) : null}

            {job.estimated_hours != null ? (
              <div className="job-detail__block">
                <h3 className="job-detail__label">Estimated hours</h3>
                <p className="job-detail__value">{job.estimated_hours}</p>
              </div>
            ) : null}

            {job.assigned_to ? (
              <div className="job-detail__block">
                <h3 className="job-detail__label">Assigned to</h3>
                <p className="job-detail__value">{job.assigned_to}</p>
              </div>
            ) : null}

            {job.notes ? (
              <div className="job-detail__block">
                <h3 className="job-detail__label">Notes</h3>
                <p className="job-detail__value">{job.notes}</p>
              </div>
            ) : null}
          </div>

          {/* Edit opens EditJobPage that the user can edit details */}
          <Link className="button button--primary job-detail__edit" to={`/jobs/${job.id}/edit`}>
            Edit job
          </Link>
        </>
      ) : null}
    </main>
  )
}

// Shares this page so App.jsx can use it
export default JobDetailsPage