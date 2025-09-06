export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div>
            <h3 className="font-bold text-lg text-theme-400">VitalLink</h3>
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} VitalLink. All Rights Reserved.</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}