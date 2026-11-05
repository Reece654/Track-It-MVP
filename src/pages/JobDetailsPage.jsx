import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { jobDeletedSuccessMessage } from '../constants'
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

    // Sends our user to JobsPage after a delete that works
    const navigate = useNavigate()
    // Stores the job once it loads
    const [job, setJob] = useState(null)
    // Stores if the job is still loading
    const [jobIsLoading, setJobIsLoading] = useState(true)
    // Stores the error message if load fails
    const [jobErrorMessage, setJobErrorMessage] = useState('')

    /*
      deleteConfirmIsOpen is true while the confirm dialog should be open.
      deleteIsSubmitting stops YES being pressed twice while Supabase is deleting.
      deleteErrorMessage holds a delete failure message when one comes back.
      deleteDialogRef points at the native dialog element.
    */

    const [deleteConfirmIsOpen, setDeleteConfirmIsOpen] = useState(false)
    const [deleteIsSubmitting, setDeleteIsSubmitting] = useState(false)
    const [deleteErrorMessage, setDeleteErrorMessage] = useState('')
    const deleteDialogRef = useRef(null)

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

  /*
    handleOpenDeleteConfirm opens the confirm dialog and clears any earlier delete error.
    We do this so a previous failure does not stay on screen when our user tries again.
  */

  function handleOpenDeleteConfirm() {
    setDeleteErrorMessage('')
    setDeleteConfirmIsOpen(true)
  }

  /*
    Opens or closes the native dialog when deleteConfirmIsOpen changes.
    showModal keeps the confirm UI on top of the page for phone and desktop.
  */

  useEffect(() => {
    const deleteDialog = deleteDialogRef.current

    if (!deleteDialog) {
      return
    }

    if (deleteConfirmIsOpen) {
      if (!deleteDialog.open) {
        deleteDialog.showModal()
      }

      return
    }

    if (deleteDialog.open) {
      deleteDialog.close()
    }
  }, [deleteConfirmIsOpen])

  // Closes the dialog without deleting the job
  function handleCancelDelete() {
    if (deleteIsSubmitting) {
      return
    }

    setDeleteConfirmIsOpen(false)
    setDeleteErrorMessage('')
  }

  /*
    Escape should close the confirm dialog the same way Cancel does.
    We stop the browser closing it on its own so deleteConfirmIsOpen stays in control.
  */

  function handleDeleteDialogCancel(event) {
    event.preventDefault()
    handleCancelDelete()
  }

  /*
    Runs only after YES, DELETE JOB is pressed.
    Deletes this job through Supabase, then opens JobsPage with the deleted success message.
    A failed delete keeps the dialog open and shows the error.
  */

  async function handleConfirmDelete() {
    setDeleteErrorMessage('')
    setDeleteIsSubmitting(true)

    const { error } = await supabase.from('jobs').delete().eq('id', jobId)

    setDeleteIsSubmitting(false)

    if (error) {
      setDeleteErrorMessage(error.message || 'Could not delete this job.')
      return
    }

    navigate('/jobs', {
      replace: true,
      state: { successMessage: jobDeletedSuccessMessage },
    })
  }

// Creates the job details page
 return (
  <>
    <main className="page">

      {/* Back takes the user to JobsPage at without changing anything */}
      <Link className="page-back" to="/jobs">
        ‹ Back
      </Link>
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
              <h1 className="job-detail__title">{job.title}</h1>
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

          {/* Delete job opens the confirm dialog under Edit */}
          <button
            type="button"
            className="button button--danger job-detail__delete"
            onClick={handleOpenDeleteConfirm}
          >
            Delete job
          </button>
        </>
      ) : null}

    </main>

      {/*
        The confirm dialog follows our Hi-Fi delete copy and uses the real job title.
        showModal keeps it in the browser top layer for phone and desktop viewports.
        Cancel calls handleCancelDelete and keeps the job.
        YES, DELETE JOB calls handleConfirmDelete, which only leaves after Supabase confirms.
      */}

      {job ? (
        <dialog
          ref={deleteDialogRef}
          className="confirm-modal"
          aria-label="Delete job confirmation"
          onCancel={handleDeleteDialogCancel}
        >
          <h2 className="confirm-modal__title">Delete this job?</h2>
          <p className="confirm-modal__job-title">{job.title}</p>
          <p className="confirm-modal__copy">
            This will permanently remove the job.
          </p>
          <p className="confirm-modal__prompt">Are you sure you want to proceed?</p>

          {deleteErrorMessage ? (
            <p className="form-error" role="alert">
              {deleteErrorMessage}
            </p>
          ) : null}

          <button
            type="button"
            className="button button--danger confirm-modal__yes"
            onClick={handleConfirmDelete}
            disabled={deleteIsSubmitting}
          >
            {deleteIsSubmitting ? 'Deleting...' : 'YES, DELETE JOB'}
          </button>
          <button
            type="button"
            className="button button--secondary confirm-modal__cancel"
            onClick={handleCancelDelete}
            disabled={deleteIsSubmitting}
          >
            Cancel
          </button>
        </dialog>
      ) : null}
  </>
  )
}

// Shares this page so App.jsx can use it
export default JobDetailsPage