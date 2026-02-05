{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.docker
    pkgs.docker-compose
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
  ];
}
