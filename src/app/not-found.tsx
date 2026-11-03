import Link from "next/link";

export default function NotFound() {
  return (
    <div className="untree_co-section">
      <div className="container">
        <h1 className="heading mb-4">Page not found</h1>
        <p>
          <Link href="/" className="btn btn-black">
            Back to the home page
          </Link>
        </p>
      </div>
    </div>
  );
}
