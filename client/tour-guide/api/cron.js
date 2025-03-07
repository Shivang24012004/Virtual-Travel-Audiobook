import axios from axios

module.exports = async (req, res) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_FOO}`);
      console.log('Cron job executed successfully:', response.data);
    } catch (error) {
      console.error('Error executing cron job:', error.message);
    }
  };