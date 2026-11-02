/*
  CreateJobPage is the form at /jobs/new.
  App.jsx draws it inside AppShell, and ProtectedRoute keeps it for a signed in user.
  A saved job goes back to JobsPage at /jobs.
  The jobs table fills in the id and the owner, so this form does not send those.
*/

/*
  useState remembers each field, the error text, and whether a save is already under way.
  Link is the Back control to JobsPage, and useNavigate returns there after a save that works.
  maxTextLength comes from constants and matches the 1000 character limit on job text.
  supabase is the same client the jobs list uses, from the services folder.
*/

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jobSavedSuccessMessage, maxTextLength } from '../constants'
import { supabase } from '../services/supabase'

/*
  These are the only statuses the jobs table accepts.
  Pending is the starting choice, which matches the database default for a new job.
  The labels are the same words JobsPage shows on each card.
*/

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

function CreateJobPage() {
  const navigate = useNavigate()

  /*
    Title, description, and location start blank because the jobs table requires all three.
    Status starts as pending so a new job has a valid status before our user changes it.
    Due date, hours, assigned person, and notes can stay blank, and a blank value is saved as no value rather than zero.
    formErrorMessage stays blank until a check or a save fails, and the form keeps what was typed.
    formIsSubmitting turns true during the save so the button cannot be pressed twice.
  */

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('pending')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [notes, setNotes] = useState('')
  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [formIsSubmitting, setFormIsSubmitting] = useState(false)

  /*
    Hours can be left blank, and a blank value is stored as empty rather than zero.
    A filled value has to be greater than zero, with at most two decimal places, because the jobs table rejects anything else.
    Extra decimals are refused here instead of being rounded.
  */

  function readEstimatedHours(value) {
    const trimmed = value.trim()

    if (!trimmed) {
      return { hours: null }
    }

    if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
      return {
        error: 'Estimated hours must be greater than zero, with up to two decimal places.',
      }
    }

    const hours = Number(trimmed)

    if (!(hours > 0)) {
      return {
        error: 'Estimated hours must be greater than zero, with up to two decimal places.',
      }
    }

    return { hours }
  }

  /*
    handleSubmit checks the form before anything is sent.
    Spaces on the ends of the text are removed so a blank-looking field is not treated as filled in.
    The insert leaves out id and created_by, and the database supplies both for the signed in user.
    A failed save shows the message and stays on this page.
    A save that works opens JobsPage again so the new row can appear in the list.
  */

  async function handleSubmit(event) {
    event.preventDefault()
    setFormErrorMessage('')

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedLocation = location.trim()
    const trimmedAssignedTo = assignedTo.trim()
    const trimmedNotes = notes.trim()

    if (!trimmedTitle || !trimmedDescription || !trimmedLocation) {
      setFormErrorMessage('Title, description, and location are required.')
      return
    }

    if (!statusOptions.some((option) => option.value === status)) {
      setFormErrorMessage('Choose a valid status.')
      return
    }

    const hoursResult = readEstimatedHours(estimatedHours)

    if (hoursResult.error) {
      setFormErrorMessage(hoursResult.error)
      return
    }

    setFormIsSubmitting(true)

    const { error } = await supabase.from('jobs').insert({
      title: trimmedTitle,
      description: trimmedDescription,
      location: trimmedLocation,
      status,
      due_date: dueDate || null,
      estimated_hours: hoursResult.hours,
      assigned_to: trimmedAssignedTo || null,
      notes: trimmedNotes || null,
    })

    setFormIsSubmitting(false)

    if (error) {
      setFormErrorMessage(error.message || 'Could not save this job.')
      return
    }

    // After a save that works we open JobsPage with the saved success message
    navigate('/jobs', {
      replace: true,
      state: { successMessage: jobSavedSuccessMessage },
    })
  }

  return (
    <main className="page">

      {/*
        Back returns to JobsPage at /jobs without saving.
      */}

      <Link className="page-back" to="/jobs">
        ‹ Back
      </Link>
      <h1 className="page-title">Create job</h1>
      <p className="page-subtitle">Required fields are marked.</p>

      {/*
        The form uses the same field layout as sign up.
        Title, description, location, and status are required.
        Due date, hours, assigned person, and notes can be left blank.
      */}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">
            Title <span className="field__required">*</span>
          </span>
          <input
            className="field__input"
            type="text"
            name="title"
            maxLength={maxTextLength}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">
            Description <span className="field__required">*</span>
          </span>
          <textarea
            className="field__input field__input--area"
            name="description"
            maxLength={maxTextLength}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">
            Location <span className="field__required">*</span>
          </span>
          <input
            className="field__input"
            type="text"
            name="location"
            maxLength={maxTextLength}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">
            Status <span className="field__required">*</span>
          </span>
          <select
            className="field__input"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            required
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {/*
          The date control keeps a year month day value for the jobs table.
          JobsPage is what turns that into day/month/year on the list.
        */}

        <label className="field">
          <span className="field__label">Due date</span>
          <input
            className="field__input"
            type="date"
            name="dueDate"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <span className="field__hint">Shown as day/month/year on your jobs list.</span>
        </label>

        <label className="field">
          <span className="field__label">Estimated hours</span>
          <input
            className="field__input"
            type="text"
            name="estimatedHours"
            inputMode="decimal"
            value={estimatedHours}
            onChange={(event) => setEstimatedHours(event.target.value)}
          />
          <span className="field__hint">
            Leave blank, or enter hours greater than zero with up to two decimal places.
          </span>
        </label>

        <label className="field">
          <span className="field__label">Assigned to</span>
          <input
            className="field__input"
            type="text"
            name="assignedTo"
            maxLength={maxTextLength}
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Notes</span>
          <textarea
            className="field__input field__input--area"
            name="notes"
            maxLength={maxTextLength}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        {/*
          The error line only appears when a check or the save did not succeed.
          Supabase supplies its own message when it has one, and otherwise the page says "Could not save this job."
        */}

        {formErrorMessage ? (
          <p className="form-error" role="alert">
            {formErrorMessage}
          </p>
        ) : null}

        {/*
          The button label changes to Saving while the insert is still waiting, and the button is disabled for that time.
        */}

        <button className="button button--primary" type="submit" disabled={formIsSubmitting}>
          {formIsSubmitting ? 'Saving...' : 'Save job'}
        </button>
      </form>
    </main>
  )
}

export default CreateJobPage
