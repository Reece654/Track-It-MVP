# Track It MVP
Track It is a mobile friendly, cloud based job tracker for solo operators and small businesses such as builders, couriers and shifting companies. This MVP lets a single user sign up, create jobs, view a job list, edit or delete jobs, and move jobs between pending, active and completed.


- **Live app:** https://main.d2891epipyfhho.amplifyapp.com/
- **Source code:** https://github.com/Reece654/Track-It-MVP

## Features
- Sign up, sign in and sign out
- Create a job with a title, description, location, due date and notes
- View all your jobs in a list
- View the full details of a job
- Edit a job, including changing its status
- Delete a job, with a confirmation step
- Track each job as Pending, Active or Completed
- Your jobs are private, so only you can see and change them

## Future Features
Team accounts, a shared calendar, quoting, invoicing and GPS tracking are planned for after the MVP.

## Tech stack
- **React and Vite:** the web app and user interface
- **Supabase:** user accounts (Auth) and the database for profiles and jobs
- **AWS Amplify Hosting:** hosts and deploys the live app





## How to use Track It

### Sign in
1. Paste URL into address bar.
2. Enter "demo@account.co.nz" into the email field.
3. Enter "demo123" into the password field
4. Click **Sign In**.
- Or use your own credential from creating an account.

### Create an Account
1. Click **Sign Up**.
2. Enter your details.
3. Click the **Sign Up** button.

### Create a job
1. On the job list, select **New job**.
2. Fill in the job details. Fields marked with * are required.
3. Select **Save job**. The job will now appear in your list.

### View a job
1. On the job list page, select **View job** on the job card.
2. The job details screen shows all of the information for that job.

### Edit a job or change its status
1. Open the job and select **Edit**.
2. Make your changes. To change the status, choose Pending, Active or Completed from the status dropdown.
3. Select **Save changes**.

### Delete a job
1. Open the job and select **Delete**.
2. Confirm that you want to delete it. This cannot be undone.

### Sign out
1. Select **Sign out** from the hamburger menu.






## Running Track It locally

### Prerequisites
- Node.js 22.12 or newer
- npm
- Git

### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/Reece654/Track-It-MVP.git
    cd Track-It-MVP
    ```

2. Install the dependencies:
    ```bash
    npm ci
    ```

3. Create a file named `.env` in the project root. Copy the contents of `supabase-env.txt` (provided separately in the assessment submission) into it. It contains the two values needed to connect to the Track It Supabase project:
    ```
    VITE_SUPABASE_URL=
    VITE_SUPABASE_ANON_KEY=
    ```

    No Supabase setup is needed, as your local copy will connect to the existing Track It database.

4. Start the development server:
    ```bash
    npm run dev
    ```

    Then open http://localhost:5173 in your browser.

The SQL scripts were used to create the database tables, profile trigger and Row Level Security policies are in the `sql` folder for reference.




## Known limitations
- Single user only, team accounts and roles are planned for a future release.
- An internet connection is needed to load and save jobs.
- This is a free beta, so there are no paid plans yet.

## Authors
- Ben Harrison
- Reece Wilson