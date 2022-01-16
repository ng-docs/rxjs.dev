# Maintainer Guidelines

# 维护者指南

These are guidelines for maintainers of this repository as (mostly) [gifted to us by](https://github.com/ReactiveX/RxJS/issues/121#issue-97747542)
His Beardliness, @jeffbcross. They are words to live by for those that are tasked with reviewing and merging pull requests and otherwise shepherding the community. As the roster of trusted maintainers grows, we'll expect these guidelines to stay pretty much the same (but suggestions are always welcome).

这些是此存储库维护者的指南，（大部分）[由 His Beardliness @jeffbcross 赠送给我们](https://github.com/ReactiveX/RxJS/issues/121#issue-97747542)。对于那些负责审查和合并拉取请求以及以其他方式引导社区的人来说，它们是可以生存的词。随着值得信赖的维护者名单的增长，我们希望这些指南几乎保持不变（但总是欢迎提出建议）。

### The ~~10~~ 6 Commandments

### 这~~10~~ 6 诫命

- __[Code of Conduct](../CODE_OF_CONDUCT.md)__. We should be setting a good example and be welcoming to all. We should be listening to all feedback from everyone in our community and respect their viewpoints and opinions.

  __[行为准则](../CODE_OF_CONDUCT.md)__。我们应该树立一个好榜样，欢迎所有人。我们应该听取社区中每个人的所有反馈，并尊重他们的观点和意见。

- __Be sure PRs meet [Contribution Guidelines](../CONTRIBUTING.md)__. It's important we keep our code base and repository consistent. The best way to do this is to know and enforce the contribution guidelines.

  __ 确保 PR 符合[贡献指南](../CONTRIBUTING.md)__。保持我们的代码库和存储库一致是很重要的。做到这一点的最好方法是了解并执行贡献指南。

- __Clean, flat commit history__. We never click the green merge button on PRs, but instead we pull down the PR branch and rebase it against master then replace master with the PR branch. See
  [example gist](https://gist.github.com/jeffbcross/307c6da45d26e29030ef). This reduces noise in the commit history, removing all of the merge commits, and keeps history flat. The flat history is beneficial to tools/scripts that analyze commit ancestry.

  __ 干净、平坦的提交历史 __。我们从不点击 PR 上的绿色合并按钮，而是拉下 PR 分支并将其重新定位为 master，然后将 master 替换为 PR 分支。请参阅[示例要点](https://gist.github.com/jeffbcross/307c6da45d26e29030ef)。这减少了提交历史中的噪音，删除了所有合并提交，并保持历史平坦。平坦的历史有利于分析提交祖先的工具/脚本。

- __Always green master__. Failing master builds tend to cascade into other broken builds, and frustration among other contributors who have rebased against a broken master. Much of our deployment and other infrastructure is based on the assumption that master is always green, nothing should be merged before Travis has confirmed that a PR is green, even for seemingly insignificant changes. Nothing should be merged into a red master, and whomever broke it should drop everything and fix it right away. Fixes
  should be submitted as a PR and verified as green instead of immediately merging to master.

  __ 永远的绿色大师 __。失败的 master 构建往往会级联到其他损坏的构建，并且其他贡献者对损坏的 master 进行重新定位会感到沮丧。我们的大部分部署和其他基础设施都基于 master 始终为绿色的假设，在 Travis 确认 PR 为绿色之前不应合并任何内容，即使对于看似微不足道的更改也是如此。任何东西都不应该合并到一个红色的主人身上，谁打破它就应该放下所有东西并立即修复它。修复应该作为 PR 提交并验证为绿色，而不是立即合并到 master。

- __No force pushes to master__. Only in rare circumstances should a force push to master be made, and other maintainers should be notified beforehand. The most common situation for a justified force push is when a commit has been pushed with an invalid message. The force push should be made as soon as possible to reduce side effects.

  __ 没有力量推动掌握 __。只有在极少数情况下才会强制推送到 master，并且应该提前通知其他维护者。合理强制推送的最常见情况是提交带有无效消息的推送。应尽快用力推动，以减少副作用。

- __Small, logical commits__. A PR should be focused on a single problem, though that problem may be reasonable to be broken into a few logical commits. For example, a global renaming may be best to be broken into a single commit that renames all files, and then a commit that renames symbols within files. This makes the review process simpler easier, so the diff of the meaty commit (where symbols are renamed) can be easily understood than if both were done in the same commit, in which case github would just
  show a deleted file and an added file.

  __ 小而合乎逻辑的提交 __。 PR 应该专注于单个问题，尽管将问题分解为几个逻辑提交可能是合理的。例如，全局重命名可能最好分解为重命名所有文件的单个提交，然后是重命名文件中的符号的提交。这使得审查过程更简单，因此可以很容易地理解大量提交（符号被重命名）的差异，而不是两者都在同一个提交中完成，在这种情况下，github 只会显示一个已删除的文件和一个添加的文件。

