# Create a new Blueprint
resource "vra_blueprint" "this" {
  name        = var.bp_name
  description = "Created by vRA terraform provider"
  project_id = vra_project.this.id

  content = <<-EOT
formatVersion: 1
inputs:
  flavor:
    type: string
    title: Flavor
    enum:
      - x-small
      - large
      - medium
      - small
  image:
    type: string
    title: Image
    enum:
      - ubuntu-xenial
      - ubuntu-bionic
resources:
  Web_Server:
    type: Cloud.Machine
    properties:
      image: '$${input.image}'
      flavor: '$${input.flavor}'
      networks:
        - network: '$${resource.Web_Network.id}'
      cloudConfig: |
        users:
          - name: sam
            ssh-authorized-keys:
              - 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDAJhmOeILoSyY2ke8oQu1pJ8td12ReCFbc5ZQflXcxYoTcUp00CLKrvdQzrOnOJAUGR0QOjp/2LxvOgq0lR0g3qSOX9Cg+wTxpOKP/VQRw9+SWv625bbAk3R6VSzIG83XJ24MPwmsa9wPgaU4cCc9SmXzKJEQGtAd9QNyO2c5fxEynZUsZbbQiNtZbliA0lyU3dAnPOofdhJ6I6aV2YFvp4juy9NdaNuR7HUTwyUfMOvilcTzdsJ/dJrc9Ypl427vgZk4opmlikVBLlWvJdBLt8PgPpl4GWgkg+WBqPUu33ExB6MfWNvXUjC3u1D9sokJwQw4NBXvvQHg4Dpf+IP75'
            sudo:
              - 'ALL=(ALL) NOPASSWD:ALL'
            groups: sudo
            shell: /bin/bash
      constraints:
        - tag: 'platform:aws'
        - tag: 'region:california'
  Web_Network:
    type: Cloud.Network
    properties:
      name: web-net
      networkType: existing
      constraints:
        - tag: 'function:web'
  EOT
  depends_on = [vra_project.this]
}
