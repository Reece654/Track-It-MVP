import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { jobSavedSuccessMessage, maxTextLength } from '../constants'
import { supabase } from '../services/supabase'

// This stores the statuses of the jobs from the dropdown
const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
]

// Shows the edit form for one job
function EditJobPage() {
    // Gets the job id from the address
    const { jobId } = useParams()
    // Gets the function that navigates the user to the next page after save
    const navigate = useNavigate()
    // Stores if the job is still loading and any error from loading it
    const [jobIsLoading, setJobIsLoading] = useState(true)
    const [jobLoadErrorMessage, setJobLoadErrorMessage] = useState('')
    // Stores all data that the user has entered in the form
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const [status, setStatus] = useState('pending')
    const [dueDate, setDueDate] = useState('')
    const [estimatedHours, setEstimatedHours] = useState('')
    const [assignedTo, setAssignedTo] = useState('')
    const [notes, setNotes] = useState('')
    // Stores any form of error and if the save is happening to stop the button being pressed twice
    const [formErrorMessage, setFormErrorMessage] = useState('')
    const [formIsSubmitting, setFormIsSubmitting] = useState(false)

    // Loads the job into the form when the page opens or the job id changes
    useEffect(() => {
        // Tracks if the page is still open
        let isMounted = true

        // Gets this job by its id, and RLS only returns it to the user who owns it
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
                    // Uses the Supabase error message or the preset message if there is not one
                    setJobLoadErrorMessage(error.message || 'Could not load this job.')
                    setJobIsLoading(false)
                    return
                }

                // Handles a job that does not exist or belongs to another user
                if (!data) {
                    setJobLoadErrorMessage('This job could not be found.')
                    setJobIsLoading(false)
                    return
                }

                // Fills each field with the saved value, or blank if nothing was saved
                setTitle(data.title ?? '')
                setDescription(data.description ?? '')
                setLocation(data.location ?? '')
                setStatus(data.status ?? 'pending')
                setDueDate(data.due_date ?? '')
                // Turns the saved hours into text so the input can show them
                setEstimatedHours(
                    data.estimated_hours == null ? '' : String(data.estimated_hours),
                )
                setAssignedTo(data.assigned_to ?? '')
                setNotes(data.notes ?? '')
                // Stops the loading message once the form is filled
                setJobIsLoading(false)
            })

        // Marks the page as closed when the user leaves so a late reply is ignored
        return () => {
            isMounted = false
        }
    }, [jobId])

    // Checks if estimated hours have been typed before saving
    // Allows user to leave blank
    // Number has to be higher then 0 and max of 2 decimal places
    function readEstimatedHours(value) {

        // Removes white spaces from the ends of the hours
        const trimmed = value.trim()

        // Saves blank hours as no value instead of 0
        if (!trimmed) {
            return { hours: null }
        }

        // Wont accept anything that isnt a number or has more then 2 decimal places
        if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
            return {
                error: 'Estimated hours must be greater than zero, with up to two decimal places.',
            }
        }

        // Turns the text into a number
        const hours = Number(trimmed)

        // Wont accept 0 since the jobs table only accepts hours above 0
        if (!(hours > 0)) {
            return {
                error: 'Estimated hours must be greater than zero, with up to two decimal places.',
            }
        }

        // Returns the checked hours ready to save
        return { hours }
    }
    
    // Handles saving the form
    // Checks the fields first and then sends the update to Supabase
    // Keeps what was typed if the save fails and will take the user back to the details page if it works
    async function handleSubmit(event) {
        // Prevents the default form submission
        event.preventDefault()
        // Resets the error message
        setFormErrorMessage('')

        // Removes the whitespaces from the ends so a field with only spaces is not treated as its entered
        const trimmedTitle = title.trim()
        const trimmedDescription = description.trim()
        const trimmedLocation = location.trim()
        const trimmedAssignedTo = assignedTo.trim()
        const trimmedNotes = notes.trim()

        // Checks the required fields are filled in
        if (!trimmedTitle || !trimmedDescription || !trimmedLocation) {
            setFormErrorMessage('Title, description, and location are required.')
            return
        }

        // Checks the status is one of the allowed options
        if (!statusOptions.some((option) => option.value === status)) {
            setFormErrorMessage('Choose a valid status.')
            return
        }

        // Checks the estimated hours
        const hoursResult = readEstimatedHours(estimatedHours)

        // Stops the save and shows the message if the hours are not valid
        if (hoursResult.error) {
            setFormErrorMessage(hoursResult.error)
            return
        }

        // Sets the form submitting state
        setFormIsSubmitting(true)

        // Sends the update to Supabase and saves blank optional fields as no value
        // Leaves out id and created by so the owner cant be changed
        const { error } = await supabase
            .from('jobs')
            .update({
                title: trimmedTitle,
                description: trimmedDescription,
                location: trimmedLocation,
                status,
                due_date: dueDate || null,
                estimated_hours: hoursResult.hours,
                assigned_to: trimmedAssignedTo || null,
                notes: trimmedNotes || null,
            })
            .eq('id', jobId)

        // Resets the form submitting state
        setFormIsSubmitting(false)

        // Shows the error and keeps what was typed if the save fails
        if (error) {
            setFormErrorMessage(error.message || 'Could not save this job.')
            return
        }

        // After a save that works we open job details with the saved success message
        navigate(`/jobs/${jobId}`, {
            replace: true,
            state: { successMessage: jobSavedSuccessMessage },
        })
    }

    // Create the edit page with a cancel link woth loading and error messages, and the edit form
    return (
        <main className="page">
            {/* Shows the cancel link that takes the user back to the job details page without saving then the page heading */}
            <Link className="page-back" to={`/jobs/${jobId}`}>
                ‹ Cancel
            </Link>
            <h1 className="page-title">Edit job</h1>
            <p className="page-subtitle">Required fields are marked. Status can be changed here.</p>

            {/* Shows loading while the job is grabbed or the error on its own if the job couldnt be loaded or found */}
            {jobIsLoading ? (
                <p className="status-message">Loading...</p>
            ) : null}

            {!jobIsLoading && jobLoadErrorMessage ? (
                <p className="form-error" role="alert">
                    {jobLoadErrorMessage}
                </p>
            ) : null}

            {/* Shows the form once the job has loaded with the same layout as the create job page */}
            {/* Title, description, location and status are required and status can only be changed here */}
            {!jobIsLoading && !jobLoadErrorMessage ? (
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

                    {/* Shows the optional fields for due date, estimated hours, assigned to and notes, which can all be left empty */}
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

                    {/* Shows the error if a save fails, then the save button changes to saving and stops user pressing it again */}
                    {formErrorMessage ? (
                        <p className="form-error" role="alert">
                            {formErrorMessage}
                        </p>
                    ) : null}

                    <button className="button button--primary" type="submit" disabled={formIsSubmitting}>
                        {formIsSubmitting ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            ) : null}
        </main>
    )
}

// Lets the edit job page be used in other files
export default EditJobPage