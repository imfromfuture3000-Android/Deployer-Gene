
# AWS EC2 Free Tier Instance
aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t2.micro --key-name my-key-pair --security-groups my-security-group --user-data file://user-data.sh
