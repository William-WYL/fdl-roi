export default function Banner() {
  const bannerImageUrl = `${import.meta.env.BASE_URL}images/banner.png`;

  return (
    <div
      style={{
        height: "300px",
        backgroundImage: `url('${bannerImageUrl}')`,
        backgroundSize: "cover",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    ></div>
  );
}
