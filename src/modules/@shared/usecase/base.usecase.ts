export default interface BaseUseCase<
  TUseCaseInput = undefined,
  TUseCaseOutput = undefined,
> {
  execute(input: TUseCaseInput): Promise<TUseCaseOutput>;
}
