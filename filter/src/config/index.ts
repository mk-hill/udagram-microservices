export const config = {
  dev: {
    aws_region: process.env.UDAGRAM_AWS_REGION,
    aws_profile: process.env.UDAGRAM_AWS_PROFILE,
    aws_media_bucket: process.env.UDAGRAM_AWS_MEDIA_BUCKET,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};
