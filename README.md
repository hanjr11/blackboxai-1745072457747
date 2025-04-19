
Built by https://www.blackbox.ai

---

```markdown
# Tracking Link Website

A simple web application that allows users to create tracking links which log visitor locations and display them on a map. This project is built using Node.js and Express.

## Project Overview

The Tracking Link Website is designed to generate unique tracking links for various campaigns. Users can create tracking links that, when accessed, will log the visitor's location based on their IP address using a geolocation API. The application provides APIs to retrieve the tracking data, allowing users to monitor visits and locations effectively.

## Installation

To install the project, you'll need to have [Node.js](https://nodejs.org) installed. Once you have Node.js set up, you can follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/tracking-link-website.git
   cd tracking-link-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

The application will run on `http://localhost:3000` by default.

## Usage

Once the application is running, you can interact with it using tools like Postman or via your web browser:

- **Create a new tracking link**:
  Send a POST request to `/api/create` with a JSON body including `campaignName`:
  ```json
  {
    "campaignName": "Your Campaign Name"
  }
  ```
  The response will contain the generated tracking URL.

- **Track a visit**:
  Access the tracking URL generated from the previous step via a web browser, which will log the visit and redirect to a specified page.

- **Retrieve tracking data**:
  Make a GET request to `/api/data/:id` replacing `:id` with your tracking link ID to get the logged visit data.

- **List all tracking links**:
  Send a GET request to `/api/links` to retrieve a summary of all tracking links created.

## Features

- Create unique tracking links for campaigns.
- Log visitor locations based on IP addresses.
- Retrieve tracking data including visit counts and location details.
- Simple and clean API design.
- Static files can be served from the `public` directory.

## Dependencies

This project uses the following Node.js libraries:

- [Express](https://expressjs.com/) - ^4.18.2
- [Axios](https://axios-http.com/) - ^1.4.0

You can find detailed information on each of these libraries on their respective websites.

## Project Structure

```
tracking-link-website/
│
├── app.js               # Main application code
├── package.json         # NPM package configuration
├── package-lock.json    # Locked versions of installed packages
└── public/              # Directory for static files (CSS, JS, images)
```

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to the maintainers of Express and Axios for their fantastic libraries.
- Geolocation functionality is powered by [ipapi.co](https://ipapi.co).
```