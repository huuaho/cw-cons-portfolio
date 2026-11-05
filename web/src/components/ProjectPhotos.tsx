// A project's photos in the sliding carousel.
import Carousel from "@/components/Carousel";

export default function ProjectPhotos({ photos, title }: { photos: string[]; title: string }) {
  return (
    <Carousel label={`${title} photos`}>
      {photos.map((src, i) => (
        <figure key={src + i} className="mb-4">
          <img src={src} alt={`${title}, photo ${i + 1}`} className="img-fluid d-block w-100" loading={i === 0 ? "eager" : "lazy"} />
        </figure>
      ))}
    </Carousel>
  );
}
